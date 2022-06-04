// import { mdiHome, mdiBriefcase, mdiDocker } from '@mdi/js';

// // MODIFY THIS TO CHANGE SIDEBAR ITEMS
// export const SIDEBAR_ITEMS = {
//   HOME: { targetId: 'sidebarHomeBtn', title: '홈', route: '/', icon: mdiHome },
//   PROJECT: { targetId: 'sidebarProjectBtn', title: '프로젝트', route: '/projects', icon: mdiBriefcase },
//   CONTAINER: { targetId: 'sidebarContainerBtn', title: '컨테이너', route: '/containers', icon: mdiDocker },
// };

// export const SET_ROUTE = 'route/SET_ROUTE';

// function getSidebarItemUsingRoute(route) {
//   for (const [k, v] of Object.entries(SIDEBAR_ITEMS))
//     if (v.route === route || route.startsWith(v.route))
//       return [k, v];
//   return [null, null];
// }

// export const setRoute = (route) => {
//   return {
//     type: SET_ROUTE,
//     route: route,
//     // sidebarItem: getSidebarItemUsingRoute(route),
//   }
// }

// const calculateInitialState = () => {
//   return {
//     route: window.location.pathname,
//     // sidebarItem: getSidebarItemUsingRoute(window.location.pathname),
//   }
// };

// export default function reducer(state = calculateInitialState(), action) {
//   switch (action.type) {
//     case SET_ROUTE: {
//       return {
//         ...state,
//         route: action.route,
//         // sidebarItem: action.sidebarItem,
//       }
//     }
//     default:
//       return state;
//   }
// };

