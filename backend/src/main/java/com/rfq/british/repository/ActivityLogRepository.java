package com.rfq.british.repository;

import com.rfq.british.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByRfqIdOrderByCreatedAtAsc(Long rfqId);
}
