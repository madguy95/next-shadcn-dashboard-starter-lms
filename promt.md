// save feature log
Summarize this fix:
- problem
- final solution

Max 100 tokens
Final state only (no history)
update to PROGRESS.md

// save session
Summarize this session for continuation:
- what was done
- current state
- next steps

Keep concise (max 200 tokens)
update to session.md

// new feature

Context:
@CLAUDE.md
@PROGRESS.md
@SESSION.md

Task:
Api đang load theo paging trên màn hình không dùng paging hay lazyload

Current behavior:
Màn hình classes và enrolment hiện đang get list theo paging mặc dù trên màn không có tính năng paging

Expected:
Chỉnh sửa để có logic đúng để có thể get đầy đủ danh sách ( 1 là dung paging, 2 là dùng lazy loading)

Constraints:
- follow existing architecture
- do not break current behavior
- minimal changes only

Output:
- root cause (max 3 lines)
- fix approach (1-2 bullets)
- code patch only
``