const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Force axios to use browser build instead of node build
  if (moduleName === 'axios') {
    return {
      filePath: require.resolve('axios/dist/browser/axios.cjs'),
      type: 'sourceFile',
    };
  }
  
  // Polyfill Node.js modules to empty objects for React Native
  if (moduleName === 'crypto' || 
      moduleName === 'http' || 
      moduleName === 'https' || 
      moduleName === 'url' || 
      moduleName === 'stream' ||
      moduleName === 'zlib' ||
      moduleName === 'util' ||
      moduleName === 'assert') {
    return {
      filePath: require.resolve('react-native/Libraries/Utilities/PolyfillFunctions.js'),
      type: 'sourceFile',
    };
  }

  // Use the default resolver for other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
