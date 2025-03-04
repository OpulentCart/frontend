import { useEffect, useState } from "react";
import axios from "axios";

const useCart = (authToken) => {
  const [cartId, setCartId] = useState(() => sessionStorage.getItem("cartId") || "");

  useEffect(() => {
    const fetchOrCreateCart = async () => {
      if (!authToken) return; // Exit if no token

      // Check session storage first
      const storedCartId = sessionStorage.getItem("cartId");
      if (storedCartId) {
        setCartId(storedCartId);
        return;
      }

      try {
        // Fetch existing cart
        const response = await axios.get("http://localhost:5007/carts", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (response.data.cartId) {
          console.log("Cart exists:", response.data.cartId);
          setCartId(response.data.cartId);
          sessionStorage.setItem("cartId", response.data.cartId);
        } else {
          console.log("No cart found, creating a new one...");

          // Create a new cart
          const createCartResponse = await axios.post(
            "http://localhost:5007/carts",
            {},
            { headers: { Authorization: `Bearer ${authToken}` } }
          );

          console.log("New cart created:", createCartResponse.data.cartId);
          setCartId(createCartResponse.data.cartId);
          sessionStorage.setItem("cartId", createCartResponse.data.cartId);
        }
      } catch (error) {
        console.error("Error fetching/creating cart:", error.response?.data || error.message);
      }
    };

    fetchOrCreateCart();
  }, [authToken]);

  return cartId;
};

export default useCart;
