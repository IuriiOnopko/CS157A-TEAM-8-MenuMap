package com.menumap.api;

import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.menumap.api.OrderServlet.Order;
import com.menumap.api.OrderServlet.OrderLine;
import com.menumap.db.Database;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet({ "/api/update/orders", "/api/update/orders/*" })
public class UpdateOrderServlet extends HttpServlet {

    private static final String ORDERS_SQL = "SELECT o.order_id, o.restaurant_id, r.name, o.order_method, o.table_code, o.current_status, "
            + "o.submitted_at, o.subtotal_amount, o.tax_amount, o.total_amount, o.cancellation_reason, "
            + "ol.line_num, ol.item_name_at_order, ol.unit_price_at_order, ol.quantity "
            + "FROM customer_order o, restaurant r, order_line ol "
            + "WHERE o.restaurant_id = r.restaurant_id AND o.order_id = ol.order_id AND ";

    private static List<Order> orders(Connection conn, String where, Object... params) throws SQLException {
        String sql = ORDERS_SQL + where + " ORDER BY o.submitted_at DESC, o.order_id DESC, ol.line_num";
        List<Order> orders = new ArrayList<>();

        try (PreparedStatement ps = Database.prepare(conn, sql, params);
                ResultSet rs = ps.executeQuery()) {

            Order order = null;
            while (rs.next()) {
                // rows are sorted by order_id DESC, so a different order_id means the next
                // order has started
                if (order == null || order.id() != rs.getLong("order_id")) {
                    order = new Order(rs.getLong("order_id"), rs.getLong("restaurant_id"), rs.getString("name"),
                            rs.getString("order_method"), rs.getString("table_code"), rs.getString("current_status"),
                            rs.getTimestamp("submitted_at").toInstant().toString(), rs.getBigDecimal("subtotal_amount"),
                            rs.getBigDecimal("tax_amount"), rs.getBigDecimal("total_amount"),
                            rs.getString("cancellation_reason"), new ArrayList<>());
                    orders.add(order);
                }
                order.items().add(new OrderLine(rs.getInt("line_num"), rs.getString("item_name_at_order"),
                        rs.getBigDecimal("unit_price_at_order"), rs.getInt("quantity")));
            }
        }
        return orders;
    }

    record StatusUpdate(String status, String reason) {
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        Long ownerId = CurrentUser.id(req);

        try (Connection connection = Database.getConnection()) {

            if (ownerId == null) {
                throw new ApiError(401, "Sign in to see order");
            } else {
                Json.write(resp, 200, orders(connection,
                        "o.restaurant_id IN (SELECT restaurant_id FROM owns_restaurant WHERE business_owner_id = ?)",
                        ownerId));
            }

        } catch (ApiError e) {
            Json.error(resp, e.status, e.getMessage());
        } catch (SQLException e) {
            log("Failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getPathInfo();
        Long ownerId = CurrentUser.id(req);

        try (Connection conn = Database.getConnection()) {

            long orderId;
            try {
                orderId = Long.parseLong(path.substring(1));
            } catch (NumberFormatException e) {
                throw new ApiError(404, "Order not found.");
            }

            StatusUpdate updateStatus = Json.read(req, StatusUpdate.class);

            String theStatus = updateStatus.status();

            String reason = null;
            if (theStatus.equals("CANCELED")) {
                reason = updateStatus.reason();
            }

            String updateInfoSQL_1 = "UPDATE customer_order SET current_status = ?, cancellation_reason = ? WHERE order_id = ? AND restaurant_id IN (SELECT restaurant_id FROM owns_restaurant WHERE business_owner_id = ?)";
            Database.update(conn, updateInfoSQL_1, theStatus, reason, orderId, ownerId);

            Json.write(resp, 200, Map.of("ok", true));

        } catch (ApiError e) {
            Json.error(resp, e.status, e.getMessage());
        } catch (SQLException e) {
            log("Failed", e);
            Json.error(resp, 503, "Database unavailable");
        }
    }

}
