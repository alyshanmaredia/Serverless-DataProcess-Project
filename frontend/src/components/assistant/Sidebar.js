// import React from 'react';
// function Sidebar({ sessions, onSelectSession }) {
//   // return (
//   //   <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '10px' }}>
//   //     <h2>Chat Sessions</h2>
//   //     <ul style={{ listStyleType: 'none', padding: 0 }}>
//   //       {sessions.map((session) => (
//   //         <li
//   //           key={session.id}
//   //           onClick={() => onSelectSession(session.id)}
//   //           style={{ cursor: 'pointer', padding: '5px 0' }}
//   //         >
//   //           {session.id} - {session.status}
//   //         </li>
//   //       ))}
//   //     </ul>
//   //   </div>
//   // );
//   return (
//     <div className="w-64 border-r border-gray-500 p-4">
//       <h1 className="bg-orange-600 text-black p-4 text-center shadow-md">
//   Chat History
// </h1>
//       <ul className="list-none p-0 mt-4">
//         {sessions.map((session) => (
//           <li key={session.id} className="mb-4">
//             <button
//               onClick={() => onSelectSession(session.id)}
//               className="bg-gray-400 text-black w-full py-2 hover:bg-gray-300"
//             >
//               {session.id} - {session.status}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default Sidebar;
import React from 'react';
import { FaHistory } from 'react-icons/fa';
function Sidebar({ sessions, onSelectSession }) {
  return (
    <div className="w-64 border-r border-gray-500 p-4">
      <h1 className="bg-orange-600 text-black p-4 text-center shadow-md flex items-center justify-center space-x-2">
        <FaHistory className="text-xl" /> 
        <span>Chat History</span>
      </h1>
      <ul className="list-none p-0 mt-4">
        {sessions.map((session) => (
          <li key={session.id} className="mb-4">
            <button
              onClick={() => onSelectSession(session.id)}
              className="bg-gray-400 text-black w-full py-2 hover:bg-gray-300"
            >
              
              {session.id}  
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
