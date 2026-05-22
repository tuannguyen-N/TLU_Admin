## 32. Attendance - Điểm danh
### 32.1. GET /api/v1/admin/attendance/session/`{classId}`

Mở phiên điểm danh cho lớp học.

**Auth**: Bắt buộc (Authorization: Bearer JWT)
**Content-Type**: Không áp dụng

**Path param**:
| Field | Type | Required | Description |
|-----|-----|-----|-----|
| classId | number | ✅ | ID lớp học phần |


**Response thành công (code 0):**
```json
{
  "code": 0,
  "message": "Session opened successfully",
  "data": "classId=1&sessionId=c85e9b83-df68-4d51-99c6-1475bae1a40e&exp=1779081158668.24e7d0c0114f0b29e24f5b44332c80dbb73822aaa116915a5dfb1204b4e88616"
}
```
**Response – User chưa đăng nhập (code -3):**
```json
{
  "code": -3,
  "data": null,
  "message": "Authentication required"
}
```

**Response – Không tìm thấy lớp học (code -2):**
```json
{
  "code": -2,
  "data": null,
  "message": "Class not found"
}
```

**Test cases:**

- ✅ token hợp lệ + classId hợp lệ → code 0 + token phiên điểm danh
- ❌ token rỗng / thiếu / invalid / hết hạn → code -3, HTTP 401
- ❌ classId không tồn tại → code -2, HTTP 404
---  
### 32.2. GET /api/v1/admin/attendance/statistics/`{classId}`

Lấy thống kê điểm danh của lớp học phần.

**Auth**: Bắt buộc (Authorization: Bearer JWT)
**Content-Type**: Không áp dụng

**Path param:**

| Field | Type | Required | Description |
|-----|-----|-----|-----|
| classId | number | ✅ | ID lớp học phần |


**Response thành công (code 0):**
```json
{
  "code": 0,
  "message": "Get statistics successfully",
  "data": {
    "classCode": "INT1001-01",
    "className": "Nhập môn lập trình - Nhóm 01",
    "totalSessions": 15,
    "students": [
      {
        "studentCode": "SV2021001",
        "studentName": "Nguyen Van A",
        "presentCount": 14,
        "absentCount": 1,
        "attendanceRate": 93.33
      },
      {
        "studentCode": "SV2021002",
        "studentName": "Tran Thi B",
        "presentCount": 12,
        "absentCount": 3,
        "attendanceRate": 80.0
      }
    ]
  }
}
```
**Cấu trúc dữ liệu ClassAttendanceSummaryResponse**
| Field | Type | Description |
|-----|-----|-----|
|presentCount | number | Số buổi có mặt|
|absentCount | number | Số buổi vắng mặt|
|attendanceRate | number | Tỷ lệ chuyên cần (%)

**Response – User chưa đăng nhập (code -3):**
```json
{
  "code": -3,
  "data": null,
  "message": "Authentication required"
}
```
**Response – Không tìm thấy dữ liệu điểm danh lớp học (code -2):**
```json
{
  "code": -2,
  "data": null,
  "message": "Attendance not found"
}
```

**Test cases:**

- ✅ token hợp lệ + classId hợp lệ → code 0 + thống kê điểm danh
- ❌ token rỗng / thiếu / invalid / hết hạn → code -3, HTTP 401
- ❌ classId không tồn tại → code -2, HTTP 404
---