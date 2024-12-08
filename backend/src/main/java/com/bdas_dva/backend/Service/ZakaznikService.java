package com.bdas_dva.backend.Service;

import com.bdas_dva.backend.Exception.ResourceNotFoundException;
import com.bdas_dva.backend.Model.Zakaznik;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ZakaznikService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Transactional(rollbackFor = Exception.class)
    public Long createZakaznik(Zakaznik zakaznik) {
        return jdbcTemplate.execute((Connection conn) -> {
            CallableStatement cs = conn.prepareCall("{call proc_zakaznik_cud(?, ?, ?, ?)}"); // 4 параметра
            cs.setString(1, "INSERT");
            cs.registerOutParameter(2, Types.NUMERIC); // p_id_zakazniku OUT
            cs.setLong(3, zakaznik.getTelefon());
            cs.setObject(4, zakaznik.getAdresaIdAdresy() != 0L ? zakaznik.getAdresaIdAdresy() : null);
            cs.execute();
            // Получаем сгенерированный ID
            Long generatedId = cs.getLong(2); // Получаем значение из выходного параметра p_id_zakazniku
            // Проверяем, не является ли полученное значение null
            if (cs.wasNull()) {
                throw new SQLException("Не удалось получить ID созданного заказчика.");
            }

            return generatedId;
        });
    }

    // Обновление существующего заказчика (Update)
    @Transactional(rollbackFor = Exception.class)
    public void updateZakaznik(Zakaznik zakaznik) throws ResourceNotFoundException {
        if (zakaznik.getIdZakazniku() == null) {
            throw new IllegalArgumentException("ID заказчика не может быть null для обновления.");
        }

        jdbcTemplate.update((Connection conn) -> {
            CallableStatement cs = conn.prepareCall("{call proc_zakaznik_cud(?, ?, ?, ?)}"); // 4 параметра
            cs.setString(1, "UPDATE");
            cs.setLong(2, zakaznik.getIdZakazniku());
            cs.setLong(3, zakaznik.getTelefon());
            cs.setObject(4, zakaznik.getAdresaIdAdresy() != 0L ? zakaznik.getAdresaIdAdresy() : null);
            return cs;
        });
    }

    // Удаление заказчика (Delete)
    @Transactional(rollbackFor = Exception.class)
    public void deleteZakaznik(Long idZakazniku) throws ResourceNotFoundException {
        if (idZakazniku == null) {
            throw new IllegalArgumentException("ID заказчика не может быть null для удаления.");
        }

        jdbcTemplate.update((Connection conn) -> {
            CallableStatement cs = conn.prepareCall("{call proc_zakaznik_cud(?, ?, ?, ?)}"); // 4 параметра
            cs.setString(1, "DELETE");
            cs.setLong(2, idZakazniku);
            cs.setNull(3, Types.NUMERIC); // p_telefon
            cs.setNull(4, Types.NUMERIC); // p_adresa_id_adresy
            return cs;
        });
    }

    // Получение заказчика по ID
    @Transactional(rollbackFor = Exception.class)
    public Zakaznik getZakaznikById(Long idZakazniku) throws ResourceNotFoundException {
        List<Zakaznik> zakaznikList = jdbcTemplate.execute("{call proc_zakaznik_r(?, ?, ?, ?)}",
                (CallableStatementCallback<List<Zakaznik>>) cs -> {
                    cs.setLong(1, idZakazniku); // p_id_zakazniku
                    cs.setNull(2, Types.NUMERIC); // p_telefon
                    cs.setNull(3, Types.NUMERIC);
                    cs.registerOutParameter(4, Types.REF_CURSOR);
                    cs.execute();
                    ResultSet rs = (ResultSet) cs.getObject(4);
                    List<Zakaznik> list = new ArrayList<>();
                    while (rs.next()) {
                        Zakaznik zakaznik = mapRowToZakaznik(rs);
                        list.add(zakaznik);
                    }
                    return list;
                });

        if (zakaznikList.isEmpty()) {
            throw new ResourceNotFoundException("Заказчик с ID " + idZakazniku + " не найден.", "idZakazniku", idZakazniku.toString());
        }

        return zakaznikList.get(0);
    }

    @Transactional(rollbackFor = Exception.class)
    public Zakaznik getZakaznikByTelefon(Long telefon) throws ResourceNotFoundException {
        List<Zakaznik> zakaznikList = jdbcTemplate.execute("{call proc_zakaznik_r(?, ?, ?, ?)}",
                (CallableStatementCallback<List<Zakaznik>>) cs -> {
                    cs.setNull(1, Types.NUMERIC); // p_id_zakazniku
                    cs.setLong(2, telefon); // p_telefon
                    cs.setNull(3, Types.NUMERIC); // p_limit
                    cs.registerOutParameter(4, Types.REF_CURSOR);
                    cs.execute();
                    ResultSet rs = (ResultSet) cs.getObject(4);
                    List<Zakaznik> list = new ArrayList<>();
                    while (rs.next()) {
                        Zakaznik zakaznik = mapRowToZakaznik(rs);
                        list.add(zakaznik);
                    }
                    return list;
                });

        if (zakaznikList.isEmpty()) {
            throw new ResourceNotFoundException("Заказчик с телефоном " + telefon + " не найден.", "telefon", telefon.toString());
        }

        return zakaznikList.get(0);
    }

    // Получение ограниченного количества заказчиков
    @Transactional(rollbackFor = Exception.class)
    public List<Zakaznik> getZakaznikWithLimit(Integer limit) {
        return jdbcTemplate.execute("{call proc_zakaznik_r(?, ?, ?)}",
                (CallableStatementCallback<List<Zakaznik>>) cs -> {
                    cs.setNull(1, Types.NUMERIC); // p_id_zakazniku
                    cs.setNull(2, Types.NUMERIC); // p_telefon
                    if (limit != null) {
                        cs.setInt(3, limit); // p_limit
                    } else {
                        cs.setNull(3, Types.NUMERIC); // p_limit
                    }
                    cs.registerOutParameter(3, Types.REF_CURSOR);
                    cs.execute();
                    ResultSet rs = (ResultSet) cs.getObject(3);
                    List<Zakaznik> list = new ArrayList<>();
                    while (rs.next()) {
                        Zakaznik zakaznik = mapRowToZakaznik(rs);
                        list.add(zakaznik);
                    }
                    return list;
                });
    }

    // Получение всех заказчиков
    @Transactional(rollbackFor = Exception.class)
    public List<Zakaznik> getAllZakaznik() {
        return jdbcTemplate.execute("{call proc_zakaznik_r(?, ?, ?)}",
                (CallableStatementCallback<List<Zakaznik>>) cs -> {
                    cs.setNull(1, Types.NUMERIC); // p_id_zakazniku
                    cs.setNull(2, Types.NUMERIC); // p_telefon
                    cs.setNull(3, Types.NUMERIC); // p_limit
                    cs.registerOutParameter(3, Types.REF_CURSOR);
                    cs.execute();
                    ResultSet rs = (ResultSet) cs.getObject(3);
                    List<Zakaznik> list = new ArrayList<>();
                    while (rs.next()) {
                        Zakaznik zakaznik = mapRowToZakaznik(rs);
                        list.add(zakaznik);
                    }
                    return list;
                });
    }

    @Transactional(rollbackFor = Exception.class)
    private Long getAdresaIdByZakaznikId(Long zakaznikId) throws ResourceNotFoundException {
        try {
            return jdbcTemplate.execute("{call proc_get_adresa_id_by_zakaznik_id(?, ?)}",
                    (CallableStatementCallback<Long>) cs -> {
                        cs.setLong(1, zakaznikId); // p_id_zakazniku
                        cs.registerOutParameter(2, Types.NUMERIC); // p_adresa_id_adresy
                        cs.execute();

                        Long adresaId = cs.getLong(2);
                        if (cs.wasNull()) {
                            throw new ResourceNotFoundException("Адрес для ZAKAZNIK с ID " + zakaznikId + " не найден.", "zakaznikId", zakaznikId.toString());
                        }
                        return adresaId;
                    });
        } catch (DataAccessException e) {
            throw new ResourceNotFoundException("ZAKAZNIK с ID " + zakaznikId + " не найден.", "zakaznikId", zakaznikId.toString());
        }
    }

    /**
     * Получить всех пользователей из USER_VIEW.
     */
    public List<Map<String, Object>> getAllUsers() {
        String query = "SELECT * FROM USER_VIEW";
        return jdbcTemplate.queryForList(query);
    }

    // Метод для маппинга строки ResultSet в объект Zakaznik
    private Zakaznik mapRowToZakaznik(ResultSet rs) throws SQLException {
        Zakaznik zakaznik = new Zakaznik();
        zakaznik.setIdZakazniku(rs.getLong("id_zakazniku"));
        zakaznik.setTelefon(rs.getLong("telefon"));
        zakaznik.setAdresaIdAdresy(rs.getLong("adresa_id_adresy"));
        return zakaznik;
    }
}
