import React from "react";

const CartSidebar = ({ cartItems, closeSidebar }) => {
  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg p-4 transition-transform duration-300 ease-in-out z-50">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Shopping Cart</h2>
        <button className="text-lg" onClick={closeSidebar}>✖</button>
      </div>

      <div className="mt-4">
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <div key={index} className="border-b py-2">
              <p>{item.name}</p>
              <p className="text-gray-600">${item.price}</p>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
