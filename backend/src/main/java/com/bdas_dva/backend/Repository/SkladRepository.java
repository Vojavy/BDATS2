package com.bdas_dva.backend.Repository;

import com.bdas_dva.backend.Model.Sklad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SkladRepository extends JpaRepository<Sklad, Long> {
    // Дополнительные методы при необходимости
}