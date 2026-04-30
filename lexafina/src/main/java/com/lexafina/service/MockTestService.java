package com.lexafina.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.lexafina.dto.BookGroup;
import com.lexafina.dto.MockTestSummary;
import com.lexafina.dto.PagedResponse;
import com.lexafina.dto.QuizSummary;
import com.lexafina.loader.DataLoader;
import com.lexafina.model.MockTest;
import com.lexafina.model.QuizRef;
import com.lexafina.model.Quizzes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MockTestService {

    private static final int SKILL_READING = 1;
    private static final int SKILL_LISTENING = 2;
    private static final int SKILL_WRITING = 7;
    private static final int SKILL_SPEAKING = 8;

    private final DataLoader dataLoader;

    public PagedResponse<BookGroup> listMockTests(String skill, int page, int pageSize, String sort) {
        int skillId = resolveSkillId(skill);

        List<MockTest> filtered = dataLoader.getAllMockTests().stream()
                .filter(mt -> mt.getSkillId() == skillId)
                .collect(Collectors.toList());

        LinkedHashMap<String, List<MockTest>> grouped = new LinkedHashMap<>();
        for (MockTest mt : filtered) {
            grouped.computeIfAbsent(mt.getBookTitle(), k -> new ArrayList<>()).add(mt);
        }

        List<BookGroup> allGroups = grouped.entrySet().stream()
                .map(e -> BookGroup.builder()
                        .title(e.getKey())
                        .total(e.getValue().size())
                        .mockTests(e.getValue().stream()
                                .map(this::toSummary)
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        if ("asc".equalsIgnoreCase(sort)) {
            allGroups.sort(Comparator.comparing(BookGroup::getTitle));
        } else {
            allGroups.sort(Comparator.comparing(BookGroup::getTitle).reversed());
        }

        int total = allGroups.size();
        int fromIndex = Math.min((page - 1) * pageSize, total);
        int toIndex = Math.min(fromIndex + pageSize, total);
        List<BookGroup> pageItems = allGroups.subList(fromIndex, toIndex);

        return PagedResponse.<BookGroup>builder()
                .total(total)
                .page(page)
                .pageSize(pageSize)
                .items(pageItems)
                .build();
    }

    /**
     * Liệt kê các quiz lẻ (single-part) của 1 skill, có hỗ trợ filter theo part.
     *
     * @param skill    "reading" | "listening"
     * @param part     null = tất cả parts; 1-3 cho reading; 1-4 cho listening
     * @param page     trang (1-based)
     * @param pageSize số lượng / trang (clamp 1..50)
     * @param sort     "asc" | "desc" — sort theo bookTitle
     * @throws IllegalArgumentException nếu part không hợp lệ với skill
     */
    public PagedResponse<QuizSummary> listQuizzes(String skill, Integer part, Integer taskType,
                                                  int page, int pageSize, String sort) {
        int skillId = resolveSkillId(skill);
        validatePart(skillId, part);
        validateTaskType(skillId, taskType);

        int safePageSize = Math.min(Math.max(pageSize, 1), 50);
        int safePage = Math.max(page, 1);

        List<QuizSummary> all = collectQuizzes(skillId, part, taskType);

        sortQuizzes(all, sort);

        int total = all.size();
        int from = Math.min((safePage - 1) * safePageSize, total);
        int to = Math.min(from + safePageSize, total);

        return PagedResponse.<QuizSummary>builder()
                .total(total)
                .page(safePage)
                .pageSize(safePageSize)
                .items(new ArrayList<>(all.subList(from, to)))
                .build();
    }

    public Optional<MockTest> getMockTestById(long testId) {
        return Optional.ofNullable(dataLoader.getMockTestMap().get(testId));
    }

    public Optional<JsonNode> getQuizById(long quizId) {
        return Optional.ofNullable(dataLoader.getQuizMap().get(quizId));
    }

    private int resolveSkillId(String skill) {
        if (skill == null) return SKILL_READING;
        return switch (skill.toLowerCase()) {
            case "listening" -> SKILL_LISTENING;
            case "writing" -> SKILL_WRITING;
            case "speaking" -> SKILL_SPEAKING;
            default -> SKILL_READING;
        };
    }

    private MockTestSummary toSummary(MockTest mt) {
        return MockTestSummary.builder()
                .id(mt.getId())
                .title(mt.getTitle())
                .thumbnail(mt.getThumbnail())
                .bookCode(mt.getBookCode())
                .skillId(mt.getSkillId())
                .status(mt.getStatus())
                .hasGuidedRetry(mt.isHasGuidedRetry())
                .build();
    }

    private void validatePart(int skillId, Integer part) {
        if (part == null) return;
        if (skillId == SKILL_WRITING) {
            throw new IllegalArgumentException("Writing does not support part filter");
        }
        if (skillId == SKILL_SPEAKING) {
            if (!(part == 1 || part == 2 || part == 3 || part == 23)) {
                throw new IllegalArgumentException("Speaking part must be 1, 2, 3 or 23");
            }
            return;
        }
        if (part < 1 || part > 4) {
            throw new IllegalArgumentException("part must be between 1 and 4");
        }
        if (skillId == SKILL_READING && part == 4) {
            throw new IllegalArgumentException("Reading does not have part 4");
        }
    }

    private void validateTaskType(int skillId, Integer taskType) {
        if (taskType == null) return;
        if (skillId != SKILL_WRITING) {
            throw new IllegalArgumentException("task_type is only supported for writing");
        }
        if (taskType != 1 && taskType != 2) {
            throw new IllegalArgumentException("task_type must be 1 or 2");
        }
    }

    private List<QuizSummary> collectQuizzes(int skillId, Integer part, Integer taskType) {
        if (skillId == SKILL_WRITING) {
            return collectWritingQuizzes(taskType);
        }
        List<QuizSummary> out = new ArrayList<>();
        for (MockTest mt : dataLoader.getAllMockTests()) {
            if (mt.getSkillId() != skillId || mt.getQuizzes() == null) continue;

            Quizzes q = mt.getQuizzes();
            if (part == null || part == 1) addQuizSummary(out, mt, q.getPart1(), 1);
            if (part == null || part == 2) addQuizSummary(out, mt, q.getPart2(), 2);
            if (part == null || part == 3) addQuizSummary(out, mt, q.getPart3(), 3);
            if (skillId == SKILL_LISTENING && (part == null || part == 4)) {
                addQuizSummary(out, mt, q.getPart4(), 4);
            }
            if (skillId == SKILL_SPEAKING && (part == null || part == 23)) {
                addQuizSummary(out, mt, q.getPart23(), 23);
            }
        }
        return out;
    }

    private void addQuizSummary(List<QuizSummary> list, MockTest mt, QuizRef ref, int part) {
        // Skip nếu mock test thiếu part đó (vd part_3 = null)
        if (ref == null || ref.getId() == 0) return;

        list.add(QuizSummary.builder()
                .id(ref.getId())
                .part(part)
                .skillId(mt.getSkillId())
                .title(lookupQuizTitle(ref.getId()))
                .time(ref.getTime())
                .questionCount(ref.getQuestionCount())
                .taskType(null)
                .slug(ref.getSlug())
                .mockTestId(mt.getId())
                .mockTestTitle(mt.getTitle())
                .bookTitle(mt.getBookTitle())
                .thumbnail(mt.getThumbnail())
                .build());
    }

    /**
     * Thu thập quiz Writing trực tiếp từ quizMap vì Writing không có mock_test.
     */
    private List<QuizSummary> collectWritingQuizzes(Integer taskType) {
        List<QuizSummary> out = new ArrayList<>();
        for (Map.Entry<Long, JsonNode> entry : dataLoader.getQuizMap().entrySet()) {
            JsonNode node = entry.getValue();
            if (node == null || node.path("type").asInt(-1) != SKILL_WRITING) continue;

            int writingTaskType = node.path("writing_task_type").asInt(0);
            if (taskType != null && writingTaskType != taskType) continue;

            long quizId = entry.getKey();
            String title = node.path("title").asText(null);
            String slug = node.path("slug").asText(null);
            String thumbnail = node.path("thumbnail").asText(null);
            int time = node.path("time").asInt(0);

            int questionCount = 0;
            JsonNode questions = node.path("questions");
            if (questions.isArray()) {
                questionCount = questions.size();
            }

            String writingBookTitle = writingTaskType == 1 ? "Writing Task 1" :
                    (writingTaskType == 2 ? "Writing Task 2" : "Writing");

            out.add(QuizSummary.builder()
                    .id(quizId)
                    .part(0)
                    .skillId(SKILL_WRITING)
                    .title(title)
                    .time(time)
                    .questionCount(questionCount)
                    .taskType(writingTaskType == 0 ? null : writingTaskType)
                    .slug(slug)
                    .mockTestId(0)
                    .mockTestTitle(null)
                    .bookTitle(writingBookTitle)
                    .thumbnail(thumbnail)
                    .build());
        }
        return out;
    }

    private String lookupQuizTitle(long quizId) {
        JsonNode node = dataLoader.getQuizMap().get(quizId);
        if (node == null) return null;
        String t = node.path("title").asText(null);
        return (t == null || t.isBlank()) ? null : t;
    }

    private void sortQuizzes(List<QuizSummary> list, String sort) {
        // Sort chính theo bookTitle, sau đó theo mockTestTitle, cuối cùng theo part
        Comparator<String> nullSafe = Comparator.nullsLast(String::compareTo);
        Comparator<QuizSummary> base = Comparator
                .comparing(QuizSummary::getBookTitle, nullSafe)
                .thenComparing(QuizSummary::getMockTestTitle, nullSafe)
                .thenComparingInt(QuizSummary::getPart);

        if ("asc".equalsIgnoreCase(sort)) {
            list.sort(base);
        } else {
            // desc: chỉ đảo bookTitle + mockTestTitle, giữ part tăng dần để UI dễ đọc
            Comparator<QuizSummary> desc = Comparator
                    .comparing(QuizSummary::getBookTitle, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(QuizSummary::getMockTestTitle, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparingInt(QuizSummary::getPart);
            list.sort(desc);
        }
    }
}
