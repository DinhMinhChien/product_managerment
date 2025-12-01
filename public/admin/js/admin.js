
const socket = io();
socket.on("newOrder", (data) => {

    // Cập nhật tổng đơn hàng
    document.getElementById("total-orders").innerText = data.totalOrders;

    // Cập nhật doanh thu
    document.getElementById("total-revenue").innerText =
        data.totalRevenue.toLocaleString() + " $";

    // Cập nhật danh sách đơn hàng mới nhất
    if (data.latestOrders) {
        const tbody = document.getElementById("latest-orders");
        tbody.innerHTML = "";

        data.latestOrders.forEach(order => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td class="fw-bold">${order.id}</td>
                <td class="fw-bold">${order.customer}</td>
                <td class="fw-bold">${order.total.toLocaleString()} $</td>
                <td>
                    <button 
                        class="btn btn-sm ${order.status === 'Đang xử lí' ? 'btn-success' : 'btn-warning'}"
                    >
                        ${order.status}
                    </button>
                </td>
                <td class="fw-bold">${new Date(order.time).toLocaleString()}</td>
            `;

            tbody.appendChild(tr);
        });
    }
});
const buttonOrderStatus = document.querySelectorAll("[button-change-status-order]");

if (buttonOrderStatus.length > 0) {

    buttonOrderStatus.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-change-status-order");
            const orderId = button.getAttribute("data-id");

            window.location.href = `/admin/dashboard/order/${status}/${orderId}`;
        });
    });
}
