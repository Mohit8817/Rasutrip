import React, { useState } from "react";
import { createMPIN } from "./services/authService";

const SetResetMPIN = () => {
    const [mpin, setMpin] = useState("");

    const handleSetMPIN = async () => {
        if (mpin.length !== 4) return alert("Enter a valid 4-digit MPIN");

        try {
            const res = await createMPIN({ mpin });

            if (res.data.success) {
                alert("MPIN set successfully.");
                window.location.href = "/dashboard";
            } else {
                alert(res.data.message || "Failed to set MPIN.");
            }
        } catch (err) {
            console.error(err);
            alert("Error setting MPIN");
        }
    };

    return (
        <div className="text-center mt-5">
            <h2>Set Your MPIN</h2>
            <input
                type="password"
                value={mpin}
                maxLength={4}
                onChange={(e) => setMpin(e.target.value)}
                placeholder="Enter 4-digit MPIN"
            />
            <br />
            <button onClick={handleSetMPIN}>Submit</button>
        </div>
    );
};

export default SetResetMPIN;
