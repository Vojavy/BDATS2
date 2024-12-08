package com.bdas_dva.backend.Service;

import com.bdas_dva.backend.Exception.ResourceNotFoundException;
import com.bdas_dva.backend.Model.Address;
import com.bdas_dva.backend.Model.User;
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

@Service
public class UserService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Создание нового пользователя (Create)
    @Transactional(rollbackFor = Exception.class)
    public void createUserZak(User user) {
        jdbcTemplate.update((Connection conn) -> {
            CallableStatement cs = conn.prepareCall("{call proc_user_cud(?, ?, ?, ?, ?, ?, ?, ?, ?)}"); // 9 параметров
            cs.setString(1, "INSERT");
            cs.setObject(2, null); // p_id_user
            cs.setString(3, user.getJmeno());
            cs.setString(4, user.getPrijmeni());
            cs.setString(5, user.getEmail());
            cs.setString(6, user.getPassword()); // Пароль должен быть хеширован
            cs.setLong(7, 1); // ROLE_USER по умолчанию
            cs.setLong(8, user.getZakaznikIdZakazniku());
            cs.setObject(9, null); // p_zamnestnanec_id_zamnestnance
            return cs;
        });
    }

    /**
     * Создание нового пользователя напрямую через SQL-запрос (для метода getAllUsers)
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsersDirect() {
        String sql = "SELECT ID_USER, JMENO, PRIJMENI, EMAIL, PASSWORD, ROLE_ID_ROLE, ZAKAZNIK_ID_ZAKAZNIKU, ZAMNESTNANEC_ID_ZAMNESTNANCE FROM \"USER\"";
        return jdbcTemplate.query(sql, (rs, rowNum) -> mapRowToUser(rs));
    }


    @Transactional(rollbackFor = Exception.class)
    public void createUser(User user) {
        jdbcTemplate.update((Connection conn) -> {
            CallableStatement cs = conn.prepareCall("{call proc_user_cud(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}"); // 9 параметров
            cs.setString(1, "INSERT");
            cs.setObject(2, null); // p_id_user
            cs.setString(3, user.getJmeno());
            cs.setString(4, user.getPrijmeni());
            cs.setString(5, user.getEmail());
            cs.setObject(6, user.getTelNumber());
            cs.setString(7, user.getPassword()); // Пароль должен быть хеширован перед вызовом
            cs.setLong(8, user.getRoleIdRole());
            cs.setObject(9, user.getZakaznikIdZakazniku());
            cs.setObject(10, user.getZamnestnanecIdZamnestnance());
            return cs;
        });
    }

    // Обновление существующего пользователя (Update)
    @Transactional(rollbackFor = Exception.class)
    public void updateUser(User user) throws ResourceNotFoundException {
        if (user.getIdUser() == null) {
            throw new IllegalArgumentException("ID пользователя не может быть null для обновления.");
        }
        jdbcTemplate.update((Connection conn) -> {
            CallableStatement cs = conn.prepareCall("{call proc_user_cud(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)}"); // 9 параметров
            cs.setString(1, "UPDATE");
            cs.setLong(2, user.getIdUser());
            cs.setString(3, user.getJmeno());
            cs.setString(4, user.getPrijmeni());
            cs.setString(5, user.getEmail());
            cs.setObject(6, user.getTelNumber());
            cs.setString(7, user.getPassword());
            cs.setLong(8, user.getRoleIdRole());
            cs.setObject(9, user.getZakaznikIdZakazniku());
            cs.setObject(10, user.getZamnestnanecIdZamnestnance());
            return cs;
        });
    }

    // Удаление пользователя (Delete)
    @Transactional(rollbackFor = Exception.class)
    public void deleteUser(Long idUser) throws ResourceNotFoundException {
        if (idUser == null) {
            throw new IllegalArgumentException("ID пользователя не может быть null для удаления.");
        }

        jdbcTemplate.update((Connection conn) -> {
            CallableStatement cs = conn.prepareCall("{call proc_user_cud(?, ?, ?, ?, ?, ?, ?, ?, ?)}"); // 9 параметров
            cs.setString(1, "DELETE");
            cs.setLong(2, idUser);
            cs.setNull(3, Types.VARCHAR); // p_jmeno
            cs.setNull(4, Types.VARCHAR); // p_prijmeni
            cs.setNull(5, Types.VARCHAR); // p_email
            cs.setNull(6, Types.VARCHAR); // p_password
            cs.setNull(7, Types.NUMERIC); // p_role_id_role
            cs.setNull(8, Types.NUMERIC); // p_zakaznik_id_zakazniku
            cs.setNull(9, Types.NUMERIC); // p_zamnestnanec_id_zamnestnance
            return cs;
        });
    }

    // Получение пользователя по email
    @Transactional(rollbackFor = Exception.class)
    public User getUserByEmail(String email) throws ResourceNotFoundException {
        List<User> users = jdbcTemplate.execute("{call proc_user_r(?, ?, ?)}",
                (CallableStatementCallback<List<User>>) cs -> {
                    cs.setObject(1, null); // p_id_user
                    cs.setObject(2, null); // p_limit
                    cs.registerOutParameter(3, Types.REF_CURSOR);
                    cs.execute();
                    ResultSet rs = (ResultSet) cs.getObject(3);
                    List<User> list = new ArrayList<>();
                    while (rs.next()) {
                        User user = mapRowToUser(rs);
                        list.add(user);
                    }
                    return list;
                });

        for (User user : users) {
            if (user.getEmail().equalsIgnoreCase(email)) {
                return user;
            }
        }
        throw new ResourceNotFoundException("Пользователь с таким email не найден.", "email", email);
    }

    // Получение пользователя по ID
    @Transactional(rollbackFor = Exception.class)
    public User getUserById(Long idUser) throws ResourceNotFoundException {
        List<User> users = jdbcTemplate.execute("{call proc_user_r(?, ?, ?)}",
                (CallableStatementCallback<List<User>>) cs -> {
                    cs.setLong(1, idUser); // p_id_user
                    cs.setObject(2, null); // p_limit
                    cs.registerOutParameter(3, Types.REF_CURSOR);
                    cs.execute();
                    ResultSet rs = (ResultSet) cs.getObject(3);
                    List<User> list = new ArrayList<>();
                    while (rs.next()) {
                        User user = mapRowToUser(rs);
                        list.add(user);
                    }
                    return list;
                });

        if (users.isEmpty()) {
            throw new ResourceNotFoundException("Пользователь с ID " + idUser + " не найден.", "idUser", idUser.toString());
        }

        return users.get(0);
    }

    // Получение всех пользователей с ограничением
    @Transactional(rollbackFor = Exception.class)
    public List<User> getAllUsers(Long startingId, Integer limit) {
        return jdbcTemplate.execute("{call proc_user_r(?, ?, ?)}",
                (CallableStatementCallback<List<User>>) cs -> {
                    if (startingId != null) {
                        cs.setLong(1, startingId); // p_id_user
                    } else {
                        cs.setNull(1, Types.NUMERIC); // p_id_user
                    }

                    if (limit != null) {
                        cs.setInt(2, limit); // p_limit
                    } else {
                        cs.setNull(2, Types.NUMERIC); // p_limit
                    }

                    cs.registerOutParameter(3, Types.REF_CURSOR);
                    cs.execute();
                    ResultSet rs = (ResultSet) cs.getObject(3);
                    List<User> list = new ArrayList<>();
                    while (rs.next()) {
                        User user = mapRowToUser(rs);
                        list.add(user);
                    }
                    return list;
                });
    }

    // Логин пользователя
    @Transactional(rollbackFor = Exception.class)
    public User loginUser(String email, String password) throws ResourceNotFoundException {
        User user = getUserByEmail(email);

        // Проверка пароля будет осуществляться в контроллере с использованием PasswordEncoder
        return user;
    }

    // Метод для поиска пользователей по фильтрам
    @Transactional(rollbackFor = Exception.class)
    public List<User> searchUsers(Long pIdUser, String pEmail, Long pRoleIdRole, Integer pLimit) {
        return jdbcTemplate.execute("{call proc_user_r_filter(?, ?, ?, ?, ?)}",
                (CallableStatementCallback<List<User>>) cs -> {
                    // Установка входных параметров
                    if (pIdUser != null) {
                        cs.setLong(1, pIdUser);
                    } else {
                        cs.setNull(1, Types.NUMERIC);
                    }

                    if (pEmail != null && !pEmail.isEmpty()) {
                        cs.setString(2, pEmail);
                    } else {
                        cs.setNull(2, Types.VARCHAR);
                    }

                    if (pRoleIdRole != null) {
                        cs.setLong(3, pRoleIdRole);
                    } else {
                        cs.setNull(3, Types.NUMERIC);
                    }

                    if (pLimit != null) {
                        cs.setInt(4, pLimit);
                    } else {
                        cs.setNull(4, Types.NUMERIC);
                    }

                    // Регистрация выходного параметра
                    cs.registerOutParameter(5, Types.REF_CURSOR);

                    // Выполнение процедуры
                    cs.execute();

                    // Получение результата
                    ResultSet rs = (ResultSet) cs.getObject(5);
                    List<User> list = new ArrayList<>();
                    while (rs.next()) {
                        User user = mapRowToUser(rs);
                        list.add(user);
                    }
                    return list;
                });
    }

    @Transactional(rollbackFor = Exception.class)
    public User getUserWithRoleByEmail(String email) throws ResourceNotFoundException {
        List<User> users = jdbcTemplate.execute("{call proc_user_with_role_by_email(?, ?)}",
                (CallableStatementCallback<List<User>>) cs -> {
                    cs.setString(1, email); // p_email
                    cs.registerOutParameter(2, Types.REF_CURSOR);
                    cs.execute();
                    ResultSet rs = (ResultSet) cs.getObject(2);
                    List<User> list = new ArrayList<>();
                    while (rs.next()) {
                        User user = mapRowToUserWithRole(rs);
                        list.add(user);
                    }
                    return list;
                });

        if (users.isEmpty()) {
            throw new ResourceNotFoundException("Пользователь с email " + email + " не найден.", "email", email);
        }

        return users.get(0);
    }

    // Метод маппинга строки ResultSet в объект User с ролью
    private User mapRowToUserWithRole(ResultSet rs) throws SQLException {
        User user = new User();
        user.setIdUser(rs.getLong("id_user"));
        user.setJmeno(rs.getString("jmeno"));
        user.setPrijmeni(rs.getString("prijmeni"));
        user.setEmail(rs.getString("email"));
        user.setRoleName(rs.getString("rolename")); // Получаем название роли
        return user;
    }

    // Метод для маппинга строки ResultSet в объект User
    private User mapRowToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setIdUser(rs.getLong("ID_USER"));
        user.setJmeno(rs.getString("JMENO"));
        user.setPrijmeni(rs.getString("PRIJMENI"));
        user.setEmail(rs.getString("EMAIL"));
        user.setPassword(rs.getString("PASSWORD"));
        user.setRoleIdRole(rs.getLong("ROLE_ID_ROLE"));
        user.setZakaznikIdZakazniku(rs.getLong("ZAKAZNIK_ID_ZAKAZNIKU"));
        user.setZamnestnanecIdZamnestnance(rs.getLong("ZAMNESTNANEC_ID_ZAMNESTNANCE"));
        return user;
    }
}
