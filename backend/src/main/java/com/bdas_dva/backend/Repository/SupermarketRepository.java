package com.bdas_dva.backend.Repository;

import com.bdas_dva.backend.Model.Supermarket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupermarketRepository extends JpaRepository<Supermarket, Long> {
    // Дополнительные методы при необходимости
}