package com.rfq.british.dto.response;

import com.rfq.british.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ActivityLogResponse {
    private Long id;
    private EventType eventType;
    private String description;
    private LocalDateTime oldCloseTime;
    private LocalDateTime newCloseTime;
    private Long bidId;
    private LocalDateTime createdAt;
}
