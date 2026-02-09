const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for util.TextEncoder is not a constructor error
// React Native 0.76+ requires proper polyfills for Node.js built-ins
config.resolver = {
  ...config.resolver,
  sourceExts: [
    ...config.resolver.sourceExts,
    'mjs',
  ],
  resolveRequest: (context, moduleName, platform) => {
    // Force axios to use browser build instead of node build
    if (moduleName === 'axios') {
      return {
        filePath: require.resolve('axios/dist/browser/axios.cjs'),
        type: 'sourceFile',
      };
    }
    
    // Polyfill Node.js modules - but keep 'util' for TextEncoder
    if (moduleName === 'crypto' || 
        moduleName === 'http' || 
        moduleName === 'https' || 
        moduleName === 'url' || 
        moduleName === 'stream' ||
        moduleName === 'zlib' ||
        moduleName === 'assert') {
      return {
        filePath: require.resolve('react-native/Libraries/Utilities/PolyfillFunctions.js'),
        type: 'sourceFile',
      };
    }

    // Use the default resolver for other modules
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
