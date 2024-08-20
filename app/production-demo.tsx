import React from 'react';

const ProductionDemo = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Production Management & Traceability Demo</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Inventory Overview</h2>
          <ul>
            <li>Raw Material A: 1000 units</li>
            <li>Product X: 500 units</li>
            <li>Product Y: 750 units</li>
          </ul>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Production Queue</h2>
          <ul>
            <li>Order #1234: 100 units of Product X (In Progress)</li>
            <li>Order #1235: 200 units of Product Y (Scheduled)</li>
            <li>Order #1236: 150 units of Product X (Pending)</li>
          </ul>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Traceability</h2>
          <p>Enter Product ID: <input type="text" className="border rounded px-2 py-1" /></p>
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Track Product</button>
        </div>
        
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Recent Activities</h2>
          <ul>
            <li>2023-05-15 14:30 - Batch #B001 completed</li>
            <li>2023-05-15 13:45 - New order #1236 received</li>
            <li>2023-05-15 11:20 - Raw Material A restocked</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductionDemo;