package com.bdas_dva.backend.Service;

import com.bdas_dva.backend.Model.Zamestnanec;
import com.bdas_dva.backend.Model.ZamestnanecRequest;
import com.bdas_dva.backend.Model.ZamestnanecResponse;
import com.bdas_dva.backend.Model.ZamestnanecUserLinkRequest;
import com.bdas_dva.backend.Model.ZamestnanecRegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataAccessException;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.*;

@Service
public class ZamestnanecService {

    private static final Logger logger = LoggerFactory.getLogger(ZamestnanecService.class);

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public ZamestnanecService(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Získá seznam zaměstnanců s možností filtrování.
     *
     * @param request Filtrační parametry.
     * @return Seznam zaměstnanců.
     * @throws Exception V případě chyby při volání procedury nebo mapování dat.
     */
    public List<ZamestnanecResponse> getZamestnanci(ZamestnanecRequest request) throws Exception {
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("proc_zamnestnanec_r")
                .declareParameters(
                        new SqlParameter("p_id_zamnestnance", Types.NUMERIC),
                        new SqlParameter("p_jmeno", Types.VARCHAR),
                        new SqlParameter("p_prijmeni", Types.VARCHAR),
                        new SqlParameter("p_supermarket_id_supermarketu", Types.NUMERIC),
                        new SqlParameter("p_sklad_id_skladu", Types.NUMERIC),
                        new SqlParameter("p_pozice_id_pozice", Types.NUMERIC),
                        new SqlParameter("p_manager_flag", Types.NUMERIC),
                        new SqlParameter("p_limit", Types.NUMERIC),
                        new SqlOutParameter("p_cursor", -10, new ZamestnanecRowMapper()) // Using -10 instead of OracleTypes.CURSOR
                );

        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_id_zamnestnance", request.getIdZamestnance())
                .addValue("p_jmeno", request.getJmeno())
                .addValue("p_prijmeni", request.getPrijmeni())
                .addValue("p_supermarket_id_supermarketu", request.getSupermarketIdSupermarketu())
                .addValue("p_sklad_id_skladu", request.getSkladIdSkladu())
                .addValue("p_pozice_id_pozice", request.getPoziceIdPozice())
                .addValue("p_manager_flag", request.getPoziceIdPozice() != null && (request.getPoziceIdPozice() == 2 || request.getPoziceIdPozice() == 3) ? 1 : 0)
                .addValue("p_limit", request.getPracovnidoba() != null ? request.getPracovnidoba() : null);

        logger.info("Volání procedury proc_zamnestnanec_r s parametry: {}", inParams);

        Map<String, Object> out = jdbcCall.execute(inParams);

        @SuppressWarnings("unchecked")
        List<ZamestnanecResponse> zamestnanci = (List<ZamestnanecResponse>) out.get("p_cursor");

        return zamestnanci != null ? zamestnanci : Collections.emptyList();
    }

    /**
     * Vytvoří nového zaměstnance.
     *
     * @param request Data pro vytvoření zaměstnance.
     * @throws Exception V případě chyby při volání procedury.
     */
    public void createZamestnanec(ZamestnanecRequest request) throws Exception {
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("proc_zamnestnanec_cud")
                .declareParameters(
                        new SqlParameter("p_action", Types.VARCHAR),
                        new SqlParameter("p_id_zamnestnance", Types.NUMERIC),
                        new SqlParameter("p_datumzamestnani", Types.DATE),
                        new SqlParameter("p_pracovnidoba", Types.NUMERIC),
                        new SqlParameter("p_supermarket_id_supermarketu", Types.NUMERIC),
                        new SqlParameter("p_sklad_id_skladu", Types.NUMERIC),
                        new SqlParameter("p_zamnestnanec_id_zamnestnance", Types.NUMERIC),
                        new SqlParameter("p_adresa_id_adresy", Types.NUMERIC),
                        new SqlParameter("p_jmeno", Types.VARCHAR),
                        new SqlParameter("p_prijmeni", Types.VARCHAR),
                        new SqlParameter("p_mzda", Types.NUMERIC),
                        new SqlParameter("p_manager_flag", Types.NUMERIC) // BOOLEAN převedeno na NUMBER
                );

        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_action", "INSERT")
                .addValue("p_id_zamnestnance", null) // NULL pro INSERT
                .addValue("p_datumzamestnani", request.getDatumZamestnani())
                .addValue("p_pracovnidoba", request.getPracovnidoba())
                .addValue("p_supermarket_id_supermarketu", request.getSupermarketIdSupermarketu())
                .addValue("p_sklad_id_skladu", request.getSkladIdSkladu())
                .addValue("p_zamnestnanec_id_zamnestnance", request.getZamestnanecIdZamestnance())
                .addValue("p_adresa_id_adresy", request.getAdresaIdAdresy())
                .addValue("p_jmeno", request.getJmeno())
                .addValue("p_prijmeni", request.getPrijmeni())
                .addValue("p_mzda", request.getMzda())
                .addValue("p_manager_flag", request.getPoziceIdPozice() != null && (request.getPoziceIdPozice() == 2 || request.getPoziceIdPozice() == 3) ? 1 : 0); // 1 = manager, 0 = not

        logger.info("Volání procedury proc_zamnestnanec_cud pro INSERT s parametry: {}", inParams);

        jdbcCall.execute(inParams);
    }

    /**
     * Aktualizuje existujícího zaměstnance.
     *
     * @param idZamestnance ID zaměstnance k aktualizaci.
     * @param request Data pro aktualizaci zaměstnance.
     * @throws Exception V případě chyby při volání procedury.
     */
    public void updateZamestnanec(Long idZamestnance, ZamestnanecRequest request) throws Exception {
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("proc_zamnestnanec_cud")
                .declareParameters(
                        new SqlParameter("p_action", Types.VARCHAR),
                        new SqlParameter("p_id_zamnestnance", Types.NUMERIC),
                        new SqlParameter("p_datumzamestnani", Types.DATE),
                        new SqlParameter("p_pracovnidoba", Types.NUMERIC),
                        new SqlParameter("p_supermarket_id_supermarketu", Types.NUMERIC),
                        new SqlParameter("p_sklad_id_skladu", Types.NUMERIC),
                        new SqlParameter("p_zamnestnanec_id_zamnestnance", Types.NUMERIC),
                        new SqlParameter("p_adresa_id_adresy", Types.NUMERIC),
                        new SqlParameter("p_jmeno", Types.VARCHAR),
                        new SqlParameter("p_prijmeni", Types.VARCHAR),
                        new SqlParameter("p_mzda", Types.NUMERIC),
                        new SqlParameter("p_manager_flag", Types.NUMERIC) // BOOLEAN převedeno na NUMBER
                );

        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_action", "UPDATE")
                .addValue("p_id_zamnestnance", idZamestnance)
                .addValue("p_datumzamestnani", request.getDatumZamestnani())
                .addValue("p_pracovnidoba", request.getPracovnidoba())
                .addValue("p_supermarket_id_supermarketu", request.getSupermarketIdSupermarketu())
                .addValue("p_sklad_id_skladu", request.getSkladIdSkladu())
                .addValue("p_zamnestnanec_id_zamnestnance", request.getZamestnanecIdZamestnance())
                .addValue("p_adresa_id_adresy", request.getAdresaIdAdresy())
                .addValue("p_jmeno", request.getJmeno())
                .addValue("p_prijmeni", request.getPrijmeni())
                .addValue("p_mzda", request.getMzda())
                .addValue("p_manager_flag", request.getPoziceIdPozice() != null && (request.getPoziceIdPozice() == 2 || request.getPoziceIdPozice() == 3) ? 1 : 0); // 1 = manager, 0 = not

        logger.info("Volání procedury proc_zamnestnanec_cud pro UPDATE s parametry: {}", inParams);

        jdbcCall.execute(inParams);
    }

    /**
     * Propojí zaměstnance s uživatelským účtem.
     *
     * @param request Data pro propojení.
     * @throws Exception V případě chyby při volání procedury.
     */
    public void linkZamestnanecUser(ZamestnanecUserLinkRequest request) throws Exception {
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("proc_zamestnanec_user_link")
                .declareParameters(
                        new SqlParameter("p_id_zamestnance", Types.NUMERIC),
                        new SqlParameter("p_id_user", Types.NUMERIC)
                );

        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_id_zamestnance", request.getIdZamestnance())
                .addValue("p_id_user", request.getIdUser());

        logger.info("Volání procedury proc_zamestnanec_user_link s parametry: {}", inParams);

        jdbcCall.execute(inParams);
    }

    /**
     * Registruje nového zaměstnance tím, že vytvoří uživatelský účet, zaměstnance a propojí je.
     *
     * @param request Data pro registraci.
     * @return ID uživatele a ID zaměstnance.
     * @throws Exception V případě chyby při volání procedury.
     */
    public Map<String, Long> registerZamestnanec(ZamestnanecRegisterRequest request) throws Exception {
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("proc_zamestnanec_register")
                .declareParameters(
                        new SqlParameter("p_jmeno", Types.VARCHAR),
                        new SqlParameter("p_prijmeni", Types.VARCHAR),
                        new SqlParameter("p_email", Types.VARCHAR),
                        new SqlParameter("p_password", Types.VARCHAR),
                        new SqlParameter("p_role_id", Types.NUMERIC),
                        new SqlParameter("p_datumzamestnani", Types.DATE),
                        new SqlParameter("p_pracovnidoba", Types.NUMERIC),
                        new SqlParameter("p_supermarket_id_supermarketu", Types.NUMERIC),
                        new SqlParameter("p_sklad_id_skladu", Types.NUMERIC),
                        new SqlParameter("p_adresa_id_adresy", Types.NUMERIC),
                        new SqlParameter("p_mzda", Types.NUMERIC),
                        new SqlParameter("p_pozice_id_pozice", Types.NUMERIC),
                        new SqlOutParameter("p_id_user", Types.NUMERIC),
                        new SqlOutParameter("p_id_zamestnance", Types.NUMERIC)
                );

        MapSqlParameterSource inParams = new MapSqlParameterSource()
                .addValue("p_jmeno", request.getJmeno())
                .addValue("p_prijmeni", request.getPrijmeni())
                .addValue("p_email", request.getEmail())
                .addValue("p_password", request.getPassword())
                .addValue("p_role_id", request.getRoleId())
                .addValue("p_datumzamestnani", request.getDatumZamestnani())
                .addValue("p_pracovnidoba", request.getPracovnidoba())
                .addValue("p_supermarket_id_supermarketu", request.getSupermarketIdSupermarketu())
                .addValue("p_sklad_id_skladu", request.getSkladIdSkladu())
                .addValue("p_adresa_id_adresy", request.getAdresaIdAdresy())
                .addValue("p_mzda", request.getMzda())
                .addValue("p_pozice_id_pozice", request.getPoziceIdPozice());

        logger.info("Volání procedury proc_zamestnanec_register s parametry: {}", inParams);

        Map<String, Object> out = jdbcCall.execute(inParams);

        Number idUserNumber = (Number) out.get("p_id_user");
        Number idZamestnanceNumber = (Number) out.get("p_id_zamestnance");

        if (idUserNumber == null || idZamestnanceNumber == null) {
            throw new Exception("Registrace zaměstnance selhala: chybí ID uživatele nebo ID zaměstnance.");
        }

        Long idUser = idUserNumber.longValue();
        Long idZamestnance = idZamestnanceNumber.longValue();

        Map<String, Long> result = new HashMap<>();
        result.put("idUser", idUser);
        result.put("idZamestnance", idZamestnance);

        logger.info("Zaměstnanec registrován s ID_USER: {} a ID_ZAMESTNANCENE: {}", idUser, idZamestnance);

        return result;
    }

    /**
     * RowMapper pro mapování řádků z CURSOR na ZamestnanecResponse.
     */
    private static class ZamestnanecRowMapper implements RowMapper<ZamestnanecResponse> {
        @Override
        public ZamestnanecResponse mapRow(ResultSet rs, int rowNum) throws SQLException {
            ZamestnanecResponse zamestnanec = new ZamestnanecResponse();
            zamestnanec.setIdZamestnance(rs.getLong("ID_ZAMNESTNANCE"));
            zamestnanec.setDatumZamestnani(rs.getDate("DATUMZAMESTNANI"));
            zamestnanec.setPracovnidoba(rs.getInt("PRACOVNIDOBA"));
            zamestnanec.setSupermarketIdSupermarketu(rs.getLong("SUPERMARKET_ID_SUPERMARKETU"));
            zamestnanec.setSkladIdSkladu(rs.getLong("SKLAD_ID_SKLADU"));
            zamestnanec.setZamestnanecIdZamestnance(rs.getLong("ZAMNESTNANEC_ID_ZAMNESTNANCE"));
            zamestnanec.setAdresaIdAdresy(rs.getLong("ADRESA_ID_ADRESY"));
            zamestnanec.setJmeno(rs.getString("JMENO"));
            zamestnanec.setPrijmeni(rs.getString("PRIJMENI"));
            zamestnanec.setMzda(rs.getDouble("MZDA"));
            zamestnanec.setPoziceIdPozice(rs.getLong("POZICE_ID_POZICE"));
            return zamestnanec;
        }
    }
}