package com.bdas_dva.backend.Repository;

import com.bdas_dva.backend.Model.Zakaznik;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ZakaznikRepository extends JpaRepository<Zakaznik, Long> {
    // Дополнительные методы при необходимости
}