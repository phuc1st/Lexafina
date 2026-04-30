package com.lexafina.loader;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lexafina.model.MockTest;
import com.lexafina.model.QuestionData;
import com.lexafina.model.QuestionType;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Slf4j
@Component
public class DataLoader {

    private static final Pattern MOCK_TEST_FILE = Pattern.compile("mock_test_(\\d+)\\.json");
    private static final Pattern QUIZ_FILE = Pattern.compile("(full|part_\\d+|part_2&3)_(\\d+)\\.json");
    private static final Pattern SKILL_PATTERN = Pattern.compile("^(Reading|Listening)\\s*-\\s*Test\\s+(\\d+)$", Pattern.CASE_INSENSITIVE);

    @Value("${lexafina.data-path}")
    private String dataPath;

    private final ObjectMapper mapper;

    @Getter
    private final Map<Long, MockTest> mockTestMap = new ConcurrentHashMap<>();

    @Getter
    private final Map<Long, JsonNode> quizMap = new ConcurrentHashMap<>();

    @Getter
    private final List<MockTest> allMockTests = new ArrayList<>();

    @Getter
    private final Map<Long, QuestionData> questionMap = new ConcurrentHashMap<>();

    @Getter
    private final Map<Long, List<QuestionData>> quizQuestionsMap = new ConcurrentHashMap<>();

    public DataLoader(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @PostConstruct
    public void init() {
        File root = new File(dataPath).getAbsoluteFile();
        if (!root.exists() || !root.isDirectory()) {
            log.error("Data path does not exist: {}", root.getAbsolutePath());
            return;
        }

        log.info("Loading data from: {}", root.getAbsolutePath());

        File[] bookDirs = root.listFiles(File::isDirectory);
        if (bookDirs == null) return;

        Arrays.sort(bookDirs, Comparator.comparing(File::getName));

        for (File bookDir : bookDirs) {
            String bookTitle = bookDir.getName();
            if (bookTitle.equalsIgnoreCase("speaking") || bookTitle.equalsIgnoreCase("writing")) {
                continue;
            }

            File[] testDirs = bookDir.listFiles(File::isDirectory);
            if (testDirs == null) continue;

            Arrays.sort(testDirs, Comparator.comparing(File::getName));

            for (File testDir : testDirs) {
                Matcher skillMatcher = SKILL_PATTERN.matcher(testDir.getName());
                if (!skillMatcher.matches()) continue;

                loadTestFolder(testDir, bookTitle);
            }
        }

        // Nạp riêng Writing/Speaking vì source data không theo cấu trúc Reading/Listening.
        loadWritingData(new File(root, "writing"));
        loadSpeakingData(new File(root, "speaking"));

        buildQuestionIndex();

        log.info("Loaded {} mock tests, {} quizzes, {} questions",
                mockTestMap.size(), quizMap.size(), questionMap.size());
    }

    private void loadTestFolder(File testDir, String bookTitle) {
        File[] files = testDir.listFiles((d, name) -> name.endsWith(".json"));
        if (files == null) return;

        for (File file : files) {
            String fileName = file.getName();

            Matcher mockMatcher = MOCK_TEST_FILE.matcher(fileName);
            if (mockMatcher.matches()) {
                loadMockTest(file, bookTitle);
                continue;
            }

            Matcher quizMatcher = QUIZ_FILE.matcher(fileName);
            if (quizMatcher.matches()) {
                long quizId = Long.parseLong(quizMatcher.group(2));
                loadQuiz(file, quizId);
            }
        }
    }

    private void loadMockTest(File file, String bookTitle) {
        try {
            JsonNode root = mapper.readTree(file);
            JsonNode dataNode = root.path("data");
            if (dataNode.isMissingNode()) return;

            MockTest mt = mapper.treeToValue(dataNode, MockTest.class);
            mt.setBookTitle(bookTitle);
            mockTestMap.put(mt.getId(), mt);
            allMockTests.add(mt);

            log.debug("Loaded mock test: {} (id={})", mt.getTitle(), mt.getId());
        } catch (IOException e) {
            log.warn("Failed to parse mock test: {}", file.getAbsolutePath(), e);
        }
    }

    private void loadQuiz(File file, long quizId) {
        try {
            JsonNode root = mapper.readTree(file);
            JsonNode dataNode = root.path("data");
            quizMap.put(quizId, dataNode.isMissingNode() ? root : dataNode);

            log.debug("Loaded quiz: id={}", quizId);
        } catch (IOException e) {
            log.warn("Failed to parse quiz: {}", file.getAbsolutePath(), e);
        }
    }

    /**
     * Nạp toàn bộ quiz Writing (task_type_1/task_type_2) trực tiếp vào quizMap.
     * Writing không có mock_test_*.json, nên chỉ lấy quiz detail có data.id hợp lệ.
     */
    private void loadWritingData(File writingRoot) {
        if (!writingRoot.exists() || !writingRoot.isDirectory()) return;
        loadWritingDirectory(writingRoot);
    }

    private void loadWritingDirectory(File dir) {
        File[] files = dir.listFiles();
        if (files == null) return;
        for (File f : files) {
            if (f.isDirectory()) {
                loadWritingDirectory(f);
                continue;
            }
            if (!f.getName().toLowerCase().endsWith(".json")) continue;
            loadWritingQuiz(f);
        }
    }

    private void loadWritingQuiz(File file) {
        try {
            JsonNode root = mapper.readTree(file);
            JsonNode dataNode = root.path("data");
            if (dataNode.isMissingNode() || !dataNode.has("id")) return;

            long quizId = dataNode.path("id").asLong(0);
            if (quizId <= 0) return;
            quizMap.put(quizId, dataNode);
        } catch (IOException e) {
            log.warn("Failed to parse writing quiz: {}", file.getAbsolutePath(), e);
        }
    }

    /**
     * Nạp Speaking theo cấu trúc forecast folders:
     * - mock_test_*.json -> mockTestMap/allMockTests
     * - full_*.json, part_*.json, part_2&3_*.json -> quizMap
     */
    private void loadSpeakingData(File speakingRoot) {
        if (!speakingRoot.exists() || !speakingRoot.isDirectory()) return;
        loadSpeakingDirectory(speakingRoot, null);
    }

    private void loadSpeakingDirectory(File dir, String bookTitle) {
        File[] files = dir.listFiles();
        if (files == null) return;

        String nextBookTitle = bookTitle;
        if (bookTitle == null && dir.getParentFile() != null &&
                "speaking".equalsIgnoreCase(dir.getParentFile().getName())) {
            nextBookTitle = dir.getName();
        }

        for (File f : files) {
            if (f.isDirectory()) {
                loadSpeakingDirectory(f, nextBookTitle);
                continue;
            }
            if (!f.getName().toLowerCase().endsWith(".json")) continue;

            Matcher mockMatcher = MOCK_TEST_FILE.matcher(f.getName());
            if (mockMatcher.matches()) {
                loadMockTest(f, nextBookTitle != null ? nextBookTitle : "Speaking");
                continue;
            }

            Matcher quizMatcher = QUIZ_FILE.matcher(f.getName());
            if (quizMatcher.matches()) {
                long quizId = Long.parseLong(quizMatcher.group(2));
                loadQuiz(f, quizId);
            }
        }
    }

    private void buildQuestionIndex() {
        for (var entry : quizMap.entrySet()) {
            long quizId = entry.getKey();
            JsonNode quizNode = entry.getValue();
            JsonNode parts = quizNode.path("parts");
            if (!parts.isArray()) continue;

            List<QuestionData> quizQuestions = new ArrayList<>();

            for (JsonNode part : parts) {
                JsonNode questionSets = part.path("question_sets");
                if (!questionSets.isArray()) continue;

                for (JsonNode qs : questionSets) {
                    JsonNode questions = qs.path("questions");
                    if (!questions.isArray()) continue;

                    for (JsonNode q : questions) {
                        QuestionData qd = parseQuestion(q, quizId);
                        if (qd != null) {
                            questionMap.put(qd.getId(), qd);
                            quizQuestions.add(qd);
                        }
                    }
                }
            }

            if (!quizQuestions.isEmpty()) {
                quizQuestionsMap.put(quizId, quizQuestions);
            }
        }
    }

    private QuestionData parseQuestion(JsonNode q, long quizId) {
        if (!q.has("id")) return null;

        long id = q.path("id").asLong();
        int order = q.path("order").asInt(0);
        String typeStr = q.path("question_type").asText("");
        QuestionType type = QuestionType.fromString(typeStr);

        String correctAnswer = q.path("correct_answer").asText("");

        List<String> correctAnswers = null;
        JsonNode answersNode = q.path("correct_answers");
        if (answersNode.isArray() && !answersNode.isEmpty()) {
            correctAnswers = StreamSupport.stream(answersNode.spliterator(), false)
                    .map(JsonNode::asText)
                    .collect(Collectors.toList());
        }

        return QuestionData.builder()
                .id(id)
                .order(order)
                .questionType(type)
                .correctAnswer(correctAnswer)
                .correctAnswers(correctAnswers)
                .quizId(quizId)
                .build();
    }
}
