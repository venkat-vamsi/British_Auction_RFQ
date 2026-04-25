package com.rfq.british.repository;

import com.rfq.british.model.AuctionConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuctionConfigRepository extends JpaRepository<AuctionConfig, Long> {
    Optional<AuctionConfig> findByRfqId(Long rfqId);
}
