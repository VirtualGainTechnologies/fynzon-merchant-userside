export const createInititals = (userType: string, name: string) => {
  let initials = '';
  let firstName = '';
  let lastName = '';

  const nameArray = name?.split(' ');

  if (nameArray[0]) {
    firstName = nameArray[0].toUpperCase();
  }

  if (userType === 'INDIVIDUAL' && nameArray[nameArray.length - 1]) {
    lastName = nameArray[nameArray.length - 1]?.toUpperCase();
  } else {
    lastName = nameArray[1]?.toUpperCase();
  }

  initials =
    firstName && lastName
      ? firstName[0] + lastName[0]
      : firstName
        ? firstName[0]
        : '';
  return initials;
};

export const getInitialsColor = (name: string) => {
  const colors = [
    '#1B2631',
    '#006400',
    '#FF2400',
    '#00008B',
    '#4B0082',
    '#808080',
    '#154360',
    '#1B2631',
    '#FF8C00',
    '#DE3163',
    '#FFC300',
    '#FF5733',
    '#7D6608',
    '#800080',
    '#EB7181',
  ];

  const index = name.length <= 15 ? name.length : 0;
  return colors[index];
};
