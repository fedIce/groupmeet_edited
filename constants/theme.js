import { Dimensions, Platform } from 'react-native';
import { moderateScale as normalize } from 'react-native-size-matters';

const colors = {
  accent: "#F3534A",
  primary: "#0AC4BA",
  secondary: "#2BDA8E",
  tertiary: "#FFE358",
  black: "#323643",
  white: "#FFFFFF",
  green: '#4BB543',
  gray: "#9DA3B4",
  gray2: "#C5CCD6",
  gray3: "#D8D9DB",
  red: '#f66',
  activeOption: 'rgba(255,255, 255 , .5)',
  option: 'rgba(0,0, 0 , .5)',
  activeOptionText: '#9DA3B4',
  optionText: '#fff',
  transparent: 'rgba(0,0,0,0)',
  semiTransBlack: 'rgba(0,0,0,.3)',
  semiTransWhite: 'rgba(255,255,255,.8)',
};

const fontSize = {
  small: normalize(12),
  regular: normalize(14),
  large: normalize(21)
}

const sizes = {
  // global sizes
  base: 16,
  font: 14,
  radius: 6,
  padding: 25,

  // font sizes
  h1: 26,
  h2: 20,
  h3: 18,
  title: 18,
  header: 16,
  body: 14,
  caption: 12
};

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const fontFamily = {
    extrabold: "RobotoExtraBold",
    bold: "RobotoBold",
    medium: "RobotoMedium",
    regular: "RobotoRegular",
    light: "RobotoLight"
}

const fonts = {
  h1: {
    fontSize: sizes.h1
  },
  h2: {
    fontSize: sizes.h2
  },
  h3: {
    fontSize: sizes.h3
  },
  header: {
    fontSize: sizes.header
  },
  title: {
    fontSize: sizes.title
  },
  body: {
    fontSize: sizes.body
  },
  caption: {
    fontSize: sizes.caption
  }
};

export { colors, sizes, fonts };
