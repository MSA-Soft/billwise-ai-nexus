import React from 'react';

const TestCSS = () => {
  return (
    <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold">CSS Test</h1>
      <p className="mt-2">If you can see this styled properly, CSS is working!</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-red-500 p-2 rounded">Red Box</div>
        <div className="bg-green-500 p-2 rounded">Green Box</div>
      </div>
    </div>
  );
};

export default TestCSS;
