export const loginAsCustomer = async (data) => {
    const res = await fetch("/api/login/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        const result = await res.json();
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", "customer");
        return true;
    }
    return false;
};

export const loginAsAgent = async (data) => {
    const res = await fetch("/api/login/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (res.ok) {
        const result = await res.json();
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", "agent");
        return true;
    }
    return false;
};
