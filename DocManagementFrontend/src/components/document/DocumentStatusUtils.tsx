
export const getStatusClass = (status: number) => {
  switch(status) {
    case 0:
      return 'from-amber-500/20 to-amber-600/10 border-l-amber-500';
    case 1:
      return 'from-green-500/20 to-green-600/10 border-l-green-500';
    case 2:
      return 'from-purple-500/20 to-purple-600/10 border-l-purple-500';
    default:
      return 'from-blue-500/20 to-blue-600/10 border-l-blue-500';
  }
};
