package com.rfq.british.service;

import com.rfq.british.enums.EventType;
import com.rfq.british.model.ActivityLog;
import com.rfq.british.model.Bid;
import com.rfq.british.model.Rfq;
import com.rfq.british.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    public ActivityLog log(Rfq rfq, EventType eventType, String description) {
        return log(rfq, eventType, description, null, null, null);
    }

    public ActivityLog log(Rfq rfq, EventType eventType, String description, Bid bid) {
        return log(rfq, eventType, description, null, null, bid);
    }

    public ActivityLog log(Rfq rfq, EventType eventType, String description,
                           LocalDateTime oldClose, LocalDateTime newClose, Bid bid) {
        ActivityLog entry = ActivityLog.builder()
                .rfq(rfq)
                .eventType(eventType)
                .description(description)
                .oldCloseTime(oldClose)
                .newCloseTime(newClose)
                .bid(bid)
                .build();
        return activityLogRepository.save(entry);
    }
}
