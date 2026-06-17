package dev.learnloop.api.bootstrap;

import dev.learnloop.api.domain.*;
import dev.learnloop.api.repository.*;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Seeds realistic demo data on first run (when the DB is empty). */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final CourseRepository courses;
    private final BadgeRepository badges;
    private final EnrollmentRepository enrollments;
    private final LessonProgressRepository progress;

    @Value("${learnloop.seed.enabled:true}")
    private boolean seedEnabled;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled || users.count() > 0) return;
        log.info("Seeding LearnLoop demo data…");

        seedBadges();

        User maya = instructor("Maya Chen", "instructor@learnloop.dev", "Senior Product Designer · ex-Figma");
        User derek = instructor("Derek Okon", "derek@learnloop.dev", "Data Engineer · SQL nerd");
        User student = student("Demo Student", "student@learnloop.dev");

        Course design = buildDesignCourse(maya);
        Course sql = buildSqlCourse(derek);
        Course react = buildReactCourse(maya);
        courses.saveAll(List.of(design, sql, react));

        // Enroll the demo student in the design course with the first module done.
        Enrollment e = new Enrollment();
        e.setStudent(student);
        e.setCourse(design);
        enrollments.save(e);
        var firstModule = design.getModules().get(0);
        for (Lesson l : firstModule.getLessons()) {
            LessonProgress lp = new LessonProgress();
            lp.setEnrollment(e);
            lp.setLesson(l);
            progress.save(lp);
        }
        student.setXp(450);
        student.setStreakDays(12);
        student.setLastActivity(LocalDate.now());
        users.save(student);

        log.info("Seed complete: {} users, {} courses.", users.count(), courses.count());
    }

    // ── builders ──────────────────────────────────────────────────────

    private User instructor(String name, String email, String title) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPasswordHash(encoder.encode("Demo1234!"));
        u.setRole(Role.INSTRUCTOR);
        u.setTitle(title);
        return users.save(u);
    }

    private User student(String name, String email) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPasswordHash(encoder.encode("Demo1234!"));
        u.setRole(Role.STUDENT);
        return users.save(u);
    }

    private void seedBadges() {
        badge("FIRST_LESSON", "First steps", "Completed your first lesson.", "🌱");
        badge("QUIZ_ACE", "Quiz ace", "Scored 100% on a quiz.", "🎯");
        badge("STREAK_7", "On a roll", "Kept a 7-day learning streak.", "🔥");
        badge("COURSE_DONE", "Course complete", "Finished an entire course.", "🏆");
    }

    private void badge(String code, String name, String desc, String icon) {
        Badge b = new Badge();
        b.setCode(code);
        b.setName(name);
        b.setDescription(desc);
        b.setIcon(icon);
        badges.save(b);
    }

    private Course course(User instructor, String title, String desc, String cat, String level, String gradient) {
        Course c = new Course();
        c.setInstructor(instructor);
        c.setTitle(title);
        c.setDescription(desc);
        c.setCategory(cat);
        c.setLevel(level);
        c.setCoverGradient(gradient);
        return c;
    }

    private CourseModule module(Course course, int pos, String title) {
        CourseModule m = new CourseModule();
        m.setCourse(course);
        m.setPosition(pos);
        m.setTitle(title);
        course.getModules().add(m);
        return m;
    }

    private void lesson(CourseModule m, int pos, String title, LessonType type, int min, String content) {
        Lesson l = new Lesson();
        l.setModule(m);
        l.setPosition(pos);
        l.setTitle(title);
        l.setType(type);
        l.setDurationMin(min);
        l.setContent(content);
        m.getLessons().add(l);
    }

    private Quiz quiz(CourseModule m, String title) {
        Quiz q = new Quiz();
        q.setModule(m);
        q.setTitle(title);
        m.setQuiz(q);
        return q;
    }

    private void question(Quiz q, int pos, String text, String explanation, String[] opts, int correctIdx) {
        Question qq = new Question();
        qq.setQuiz(q);
        qq.setPosition(pos);
        qq.setText(text);
        qq.setExplanation(explanation);
        for (int i = 0; i < opts.length; i++) {
            QuestionOption o = new QuestionOption();
            o.setQuestion(qq);
            o.setPosition(i);
            o.setText(opts[i]);
            o.setCorrect(i == correctIdx);
            qq.getOptions().add(o);
        }
        q.getQuestions().add(qq);
    }

    // ── courses ───────────────────────────────────────────────────────

    private Course buildDesignCourse(User maya) {
        Course c = course(maya, "Product Design from Scratch",
            "Go from blank canvas to a validated product design: research, ideation, prototyping and handoff. Hands-on, with a real case study throughout.",
            "Design", "Beginner", "t-1");

        CourseModule m1 = module(c, 1, "Foundations");
        lesson(m1, 1, "What product design really is", LessonType.VIDEO, 8,
            "Product design is solving real user problems within business constraints — not just making things pretty.");
        lesson(m1, 2, "The double-diamond process", LessonType.TEXT, 6,
            "Discover, Define, Develop, Deliver — diverge to explore, converge to decide, twice.");

        CourseModule m2 = module(c, 2, "Research");
        lesson(m2, 1, "Choosing who to talk to", LessonType.VIDEO, 9, "Recruit for the behavior you're studying, not demographics.");
        lesson(m2, 2, "How to run user interviews", LessonType.VIDEO, 12, "Prep a script, avoid leading questions, and listen more than you talk.");
        lesson(m2, 3, "Synthesis: affinity mapping", LessonType.VIDEO, 14, "Cluster observations into themes to surface real insights.");
        Quiz q = quiz(m2, "Research basics");
        question(q, 1, "Which of these is a leading interview question?",
            "It suggests the desired answer. Good questions are open and neutral.",
            new String[]{
                "Tell me about the last time you ordered food.",
                "Don't you think this app is easier to use?",
                "What did you do after opening the app?"
            }, 1);
        question(q, 2, "What's the goal of affinity mapping?",
            "It groups raw observations into themes so patterns emerge.",
            new String[]{"Pick the prettiest design", "Cluster observations into themes", "Estimate development cost"}, 1);
        question(q, 3, "When should you recruit research participants?",
            "Recruit for the behavior you're studying, not just demographics.",
            new String[]{"By matching the behavior you're studying", "Only friends and family", "Whoever replies first"}, 0);

        CourseModule m3 = module(c, 3, "Prototyping");
        lesson(m3, 1, "Low- vs high-fidelity", LessonType.VIDEO, 10, "Match fidelity to the question you're trying to answer.");
        lesson(m3, 2, "Designing a usability test", LessonType.TEXT, 7, "Give tasks, not instructions; watch where people get stuck.");
        return c;
    }

    private Course buildSqlCourse(User derek) {
        Course c = course(derek, "SQL for Curious Humans",
            "Query real datasets with confidence. From SELECT to JOINs and window functions, explained the way you wish someone had the first time.",
            "Data", "Beginner", "t-2");

        CourseModule m1 = module(c, 1, "Getting data out");
        lesson(m1, 1, "SELECT, WHERE, ORDER BY", LessonType.VIDEO, 11, "The three verbs that answer 80% of questions.");
        lesson(m1, 2, "Filtering like a pro", LessonType.TEXT, 8, "IN, BETWEEN, LIKE and NULL handling.");
        Quiz q = quiz(m1, "Querying basics");
        question(q, 1, "Which clause filters rows before grouping?",
            "WHERE filters individual rows; HAVING filters groups.",
            new String[]{"HAVING", "WHERE", "ORDER BY"}, 1);
        question(q, 2, "What does COUNT(*) return?",
            "It counts rows, including those with NULLs.",
            new String[]{"Only non-null values in a column", "The number of rows", "The sum of a column"}, 1);

        CourseModule m2 = module(c, 2, "Combining tables");
        lesson(m2, 1, "INNER vs LEFT JOIN", LessonType.VIDEO, 13, "Keep matches, or keep everything on one side.");
        lesson(m2, 2, "Aggregations & GROUP BY", LessonType.VIDEO, 12, "Roll rows up into summaries.");
        return c;
    }

    private Course buildReactCourse(User maya) {
        Course c = course(maya, "React Patterns in Practice",
            "Move beyond useState soup. Composition, custom hooks, state management and performance patterns from real codebases.",
            "Code", "Intermediate", "t-3");
        CourseModule m1 = module(c, 1, "Composition");
        lesson(m1, 1, "Thinking in components", LessonType.VIDEO, 10, "Small, focused components compose into flexible UIs.");
        lesson(m1, 2, "Custom hooks", LessonType.TEXT, 9, "Extract stateful logic you reuse into a hook.");
        return c;
    }
}
