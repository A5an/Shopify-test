import {useState, useEffect} from 'react';
import {
  useApi,
  AdminAction,
  BlockStack,
  Button,
  TextField,
  ChoiceList,
  Box,
  InlineStack,
  Image,
  Text,
  Select,
  Checkbox,
  reactExtension,
} from '@shopify/ui-extensions-react/admin';
import BundleMetafields from './BundleMetafields.jsx';

function ProductBundleExtension() {
  const {i18n, close, data} = useApi();
  
  // Debug log to check if data is being received
  console.log('Extension Data:', data);
  
  const [bundleConfig, setBundleConfig] = useState({
    keyType: 'same',
    fabrication: false,
    additionalKeys: 0,
    customOptions: {},
  });
  const [productImages, setProductImages] = useState([]);

  useEffect(() => {
    if (data?.product?.images?.edges) {
      console.log('Product Images:', data.product.images.edges);
      setProductImages(data.product.images.edges.map(edge => edge.node));
    }
  }, [data]);

  const handleSave = async () => {
    try {
      // Save bundle configuration to metafields
      const metafields = {
        keyType: bundleConfig.keyType,
        fabrication: bundleConfig.fabrication,
        additionalKeys: bundleConfig.additionalKeys,
        customOptions: bundleConfig.customOptions,
      };

      // Here you would implement the API call to save metafields
      console.log('Saving bundle configuration:', metafields);
      close();
    } catch (error) {
      console.error('Error saving bundle configuration:', error);
    }
  };

  return (
    <AdminAction
      primaryAction={<Button onPress={handleSave}>Save Bundle</Button>}
      secondaryAction={<Button onPress={close}>Cancel</Button>}
    >
      <BlockStack gap="large">
        <Text variant="headingMd">Bundle Configuration</Text>
        
        {/* Debug information */}
        <Box>
          <Text variant="bodyMd">Product ID: {data?.product?.id || 'No product ID'}</Text>
          <Text variant="bodyMd">Product Title: {data?.product?.title || 'No product title'}</Text>
        </Box>
        
        {/* Key Type Selection */}
        <Box>
          <ChoiceList
            title="Key Configuration"
            choices={[
              {label: 'Same Key', value: 'same'},
              {label: 'Custom Key', value: 'custom'},
            ]}
            selected={[bundleConfig.keyType || 'same']}
            onChange={(value) => {
              if (Array.isArray(value) && value.length > 0) {
                setBundleConfig(prev => ({...prev, keyType: value[0]}));
              }
            }}
          />
        </Box>

        {/* Fabrication Option */}
        <Box>
          <Checkbox
            label="Fabrication Required"
            checked={bundleConfig.fabrication}
            onChange={(value) => setBundleConfig(prev => ({...prev, fabrication: value}))}
          />
        </Box>

        {/* Additional Keys */}
        <Box>
          <TextField
            type="number"
            label="Additional Keys"
            value={bundleConfig.additionalKeys.toString()}
            onChange={(value) => setBundleConfig(prev => ({...prev, additionalKeys: parseInt(value) || 0}))}
          />
        </Box>

        {/* Product Images */}
        {productImages.length > 0 ? (
          <Box>
            <Text variant="headingSm">Product Images</Text>
            <InlineStack gap="medium">
              {productImages.slice(0, 2).map((image) => (
                <Box key={image.id} border="base" padding="base">
                  <Image source={image.url} alt={image.altText || 'Product image'} />
                </Box>
              ))}
            </InlineStack>
          </Box>
        ) : (
          <Text variant="bodyMd">No product images available</Text>
        )}

        {/* Custom Options */}
        <Box>
          <Text variant="headingSm">Custom Options</Text>
          <BlockStack gap="medium">
            <TextField
              label="Option Name"
              value={bundleConfig.customOptions.name || ''}
              onChange={(value) => setBundleConfig(prev => ({
                ...prev,
                customOptions: {...prev.customOptions, name: value}
              }))}
            />
            <Select
              label="Option Type"
              options={[
                {label: 'Text', value: 'text'},
                {label: 'Number', value: 'number'},
                {label: 'Select', value: 'select'},
              ]}
              value={bundleConfig.customOptions.type || 'text'}
              onChange={(value) => setBundleConfig(prev => ({
                ...prev,
                customOptions: {...prev.customOptions, type: value}
              }))}
            />
          </BlockStack>
        </Box>

        {/* Bundle Metafields */}
        <BundleMetafields />
      </BlockStack>
    </AdminAction>
  );
}

export default reactExtension('admin.product-details.action.render', () => <ProductBundleExtension />); 