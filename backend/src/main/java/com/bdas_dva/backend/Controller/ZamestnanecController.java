package com.bdas_dva.backend.Controller;

import com.bdas_dva.backend.Model.Zamestnanec.*;
import com.bdas_dva.backend.Service.UtilService;
import com.bdas_dva.backend.Service.ZamestnanecService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataAccessException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/zamestnanci")
public class ZamestnanecController {

    @Autowired
    private ZamestnanecService zamestnanecService;

    @Autowired
    private UtilService utilService;


    /**
     * Získá detail zaměstnanca podle jeho ID.
     *
     * @param idZamestnance ID zaměstnanca.
     * @return Detail zaměstnanca ve formátu JSON.
     */
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @GetMapping("/{idZamestnance}")
    public ResponseEntity<?> getZamestnanecById(@PathVariable Long idZamestnance) {
        try {
            Map<String, Object> zamestnanec = zamestnanecService.getEmployeeFromViewDetails(idZamestnance);
            if (zamestnanec != null && !zamestnanec.isEmpty()) {
                return ResponseEntity.ok(zamestnanec);
            } else {
                return ResponseEntity.status(404).body("Zaměstnanec s tímto ID nebyl nalezen.");
            }
        } catch (DataAccessException dae) {
            dae.printStackTrace();
            return ResponseEntity.status(500).body("Databázová chyba při získávání zaměstnance.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Chyba při získávání zaměstnance: " + e.getMessage());
        }
    }

    /**
     * Získá detail zaměstnanca podle jeho ID.
     *
     * @param idZamestnance ID zaměstnanca.
     * @return Detail zaměstnanca ve formátu JSON.
     */
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @GetMapping("/hierarchy/{idZamestnance}")
    public ResponseEntity<?> getZamestnanecHierarchyById(@PathVariable Long idZamestnance) {
        try {
            List<Zamestnanec> zamestnanecList = zamestnanecService.getEmployeeHierarchy(idZamestnance);
            if (zamestnanecList != null && !zamestnanecList.isEmpty()) {
                return ResponseEntity.ok(zamestnanecList);
            } else {
                return ResponseEntity.status(404).body("Zaměstnanec s tímto ID nebyl nalezen.");
            }
        } catch (DataAccessException dae) {
            dae.printStackTrace();
            return ResponseEntity.status(500).body("Databázová chyba při získávání zaměstnance.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Chyba při získávání zaměstnance: " + e.getMessage());
        }
    }

    /**
     * Získá seznam zaměstnanců s možností filtrování.
     * @return Seznam zaměstnanců ve formátu JSON.
     */
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getZamestnanci() {
        try {
            List<ZamestnanecResponse> zamestnanci = zamestnanecService.getAllZamestnanci();
            return ResponseEntity.ok(zamestnanci);
        } catch (DataAccessException dae) {
            dae.printStackTrace();
            return ResponseEntity.status(500).body("Databázová chyba při získávání zaměstnanců.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Chyba při získávání zaměstnanců: " + e.getMessage());
        }
    }

    /**
     * Vytvoří nového zaměstnance.
     *
     * @param request Data pro vytvoření zaměstnance.
     * @return Odpověď s potvrzením.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createZamestnanec(@RequestBody ZamestnanecRequest request) {
        try {
            zamestnanecService.createZamestnanec(request);
            return ResponseEntity.ok("Zaměstnanec byl úspěšně vytvořen.");
        } catch (DataAccessException dae) {
            dae.printStackTrace();
            return ResponseEntity.status(500).body("Databázová chyba při vytváření zaměstnance.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Chyba při vytváření zaměstnance: " + e.getMessage());
        }
    }

    /**
     * Aktualizuje existujícího zaměstnance.
     *
     * @param idZamestnance ID zaměstnance k aktualizaci.
     * @param request        Data pro aktualizaci.
     * @return Odpověď s potvrzením.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{idZamestnance}")
    public ResponseEntity<?> updateZamestnanec(
            @PathVariable Long idZamestnance,
            @RequestBody ZamestnanecRequest request
    ) {
        try {
            zamestnanecService.updateZamestnanec(idZamestnance, request);
            return ResponseEntity.ok("Zaměstnanec byl úspěšně aktualizován.");
        } catch (DataAccessException dae) {
            dae.printStackTrace();
            return ResponseEntity.status(500).body("Databázová chyba při aktualizaci zaměstnance.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Chyba při aktualizaci zaměstnance: " + e.getMessage());
        }
    }

    /**
     * Propojí zaměstnance s uživatelským účtem.
     *
     * @param request Data pro propojení.
     * @return Odpověď s potvrzením.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/link")
    public ResponseEntity<?> linkZamestnanecUser(@RequestBody ZamestnanecUserLinkRequest request) {
        try {
            zamestnanecService.linkZamestnanecUser(request);
            return ResponseEntity.ok("Zaměstnanec byl úspěšně propojen s uživatelským účtem.");
        } catch (DataAccessException dae) {
            dae.printStackTrace();
            return ResponseEntity.status(500).body("Databázová chyba při propojení zaměstnance s uživatelem.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Chyba při propojení zaměstnance s uživatelem: " + e.getMessage());
        }
    }

    /**
     * Registruje nového zaměstnance (vytvoří uživatele, zaměstnance a propojí je).
     *
     * @param request Data pro registraci.
     * @return Odpověď s ID uživatele a ID zaměstnance.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register")
    public ResponseEntity<?> registerZamestnanec(@RequestBody ZamestnanecRegisterRequest request) {
        try {
            Map<String, Long> result = zamestnanecService.registerZamestnanec(request);
            return ResponseEntity.ok(result);
        } catch (DataAccessException dae) {
            dae.printStackTrace();
            return ResponseEntity.status(500).body("Databázová chyba při registraci zaměstnance.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Chyba při registraci zaměstnance: " + e.getMessage());
        }
    }

    /**
     * Получение списка всех позиций (pozice).
     *
     * @return Список позиций.
     */
    @GetMapping("/pozice")
    public ResponseEntity<?> getAllPozice() {
        try {
            List<Map<String, Object>> pozice = zamestnanecService.getAllPozice();
            return ResponseEntity.ok(pozice);
        } catch (DataAccessException dae) {
            dae.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка базы данных при получении списка позиций.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка при получении списка позиций: " + e.getMessage());
        }
    }

    /**
     * Создать новую pozice.
     * @param pozice Объект Pozice с полем 'nazev'.
     * @return Статус операции.
     */
    @PostMapping("/pozice")
    public ResponseEntity<?> createPozice(@RequestBody Pozice pozice) {
        try {
            if (pozice.getNazev() == null || pozice.getNazev().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Поле 'nazev' обязательно для заполнения.");
            }

            utilService.executePoziceCUD("INSERT", pozice);
            return ResponseEntity.ok("Pozice успешно создана.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка при создании pozice: " + e.getMessage());
        }
    }

    /**
     * Обновить существующую pozice.
     * @param idPozice ID pozice, которую нужно обновить.
     * @param pozice Объект Pozice с полем 'nazev' (может быть обновлено).
     * @return Статус операции.
     */
    @PutMapping("/pozice/{id}")
    public ResponseEntity<?> updatePozice(@PathVariable("id") Long idPozice, @RequestBody Pozice pozice) {
        try {
            if (idPozice == null) {
                return ResponseEntity.badRequest().body("ID pozice обязательно для обновления.");
            }

            pozice.setIdPozice(idPozice);
            utilService.executePoziceCUD("UPDATE", pozice);
            return ResponseEntity.ok("Pozice успешно обновлена.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка при обновлении pozice: " + e.getMessage());
        }
    }

    /**
     * Удалить существующую pozice.
     * @param idPozice ID pozice, которую нужно удалить.
     * @return Статус операции.
     */
    @DeleteMapping("/pozice/{id}")
    public ResponseEntity<?> deletePozice(@PathVariable("id") Long idPozice) {
        try {
            if (idPozice == null) {
                return ResponseEntity.badRequest().body("ID pozice обязательно для удаления.");
            }

            Pozice pozice = new Pozice();
            pozice.setIdPozice(idPozice);
            utilService.executePoziceCUD("DELETE", pozice);
            return ResponseEntity.ok("Pozice успешно удалена.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка при удалении pozice: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/average-salary")
    public ResponseEntity<?> getAverageSubordinateSalary(@PathVariable("id") Long idZamestnance) {
        try {
            Double averageSalary = zamestnanecService.getAverageSubordinateSalary(idZamestnance);
            if (averageSalary != null) {
                return ResponseEntity.ok(averageSalary);
            } else {
                return ResponseEntity.status(404).body("Данные о средней зарплате отсутствуют.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка при получении средней зарплаты: " + e.getMessage());
        }
    }

    /**
     * Получение средней зарплаты подчиненных сотрудника через процедуру.
     *
     * @param idZamestnance ID сотрудника.
     * @return Средняя зарплата подчиненных.
     */
    @GetMapping("/{id}/average-salary-procedure")
    public ResponseEntity<?> getAverageSubordinateSalaryProcedure(@PathVariable("id") Long idZamestnance) {
        try {
            Double averageSalary = zamestnanecService.getAverageSubordinateSalaryProcedure(idZamestnance);
            if (averageSalary != null) {
                return ResponseEntity.ok(averageSalary);
            } else {
                return ResponseEntity.status(404).body("Данные о средней зарплате отсутствуют.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка при выполнении процедуры: " + e.getMessage());
        }
    }

    @PostMapping("/apply-salary-indexation")
    public ResponseEntity<?> applySalaryIndexation(@RequestBody Map<String, Double> indexationData) {
        try {
            Double minPercentage = indexationData.get("minPercentage");
            Double maxPercentage = indexationData.get("maxPercentage");

            if (minPercentage == null || maxPercentage == null) {
                return ResponseEntity.badRequest().body("Missing minPercentage or maxPercentage.");
            }

            String result = zamestnanecService.applySalaryIndexationProcedure(minPercentage, maxPercentage);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка при выполнении процедуры: " + e.getMessage());
        }
    }

    @GetMapping("/all-salaries")
    public ResponseEntity<?> getAllEmployeesFromView() {
        try {
            List<Map<String, Object>> employees = zamestnanecService.getAllEmployeesFromView();
            return ResponseEntity.ok(employees);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка при получении списка сотрудников из представления: " + e.getMessage());
        }
    }
}
