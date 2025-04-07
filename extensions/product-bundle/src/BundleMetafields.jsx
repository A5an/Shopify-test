import {useState, useEffect} from 'react';
import {
  useApi,
  BlockStack,
  Text,
  Button,
} from '@shopify/ui-extensions-react/admin';

export default function BundleMetafields() {
  const {data} = useApi();
  const [metafields, setMetafields] = useState({});

  useEffect(() => {
    if (data?.product?.metafields?.edges) {
      const bundleMetafields = data.product.metafields.edges
        .filter(edge => edge.node.namespace === 'bundle')
        .reduce((acc, edge) => {
          acc[edge.node.key] = edge.node.value;
          return acc;
        }, {});
      setMetafields(bundleMetafields);
    }
  }, [data]);

  const handleUpdateMetafield = async (key, value) => {
    try {
      // Here you would implement the API call to update metafields
      console.log('Updating metafield:', {key, value});
    } catch (error) {
      console.error('Error updating metafield:', error);
    }
  };

  return (
    <BlockStack gap="medium">
      <Text variant="headingSm">Bundle Configuration</Text>
      {Object.entries(metafields).map(([key, value]) => (
        <Text key={key}>
          {key}: {value}
        </Text>
      ))}
    </BlockStack>
  );
} 