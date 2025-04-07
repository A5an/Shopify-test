import {useState} from 'react';
import {
  useApi,
  AdminAction,
  BlockStack,
  Button,
  TextField,
  ChoiceList,
  Box,
  InlineStack,
  NumberField,
  Select,
} from '@shopify/ui-extensions-react/admin';

export default function PurchaseOptionsActionExtension() {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const {i18n, close, data} = useApi();
  console.log({data});
  const [merchantCode, setMerchantCode] = useState('');
  const [planName, setPlanName] = useState('');
  const [discountType, setDiscountType] = useState('percentageOff');
  const [deliveryOptions, setDeliveryOptions] = useState({
    frequency: 0,
    timeType: 'day',
    discount: 0,
  });

  const updateDeliveryOption = (field, value) => {
    setDeliveryOptions((prevOptions) => ({
      ...prevOptions,
      [field]: value,
    }));
  };

  function handleSave() {
    // This is where you can use the sellingPlanGroupsCreate and sellingPlanGroupsUpdate mutations
    console.log('saving');
    close();
  }

  function getDiscountLabel(discountType) {
    switch (discountType) {
      case 'percentageOff':
        return 'Percentage off';
      case 'amountOff':
        return 'Amount off';
      case 'flatRate':
        return 'Flat rate';
    }
  }

  return (
    <AdminAction
      primaryAction={<Button onPress={handleSave}>Save</Button>}
      secondaryAction={
        <Button
          onPress={() => {
            console.log('closing');
            close();
          }}
        >
          Cancel
        </Button>
      }
    >
      <BlockStack gap="large">
        {i18n.translate('welcome')}
        <TextField
          label="Title"
          placeholder="Subscribe and save"
          value={planName}
          onChange={setPlanName}
        />
        <TextField
          label="Internal description"
          value={merchantCode}
          onChange={setMerchantCode}
        />
        <Box>
          <ChoiceList
            name="discountType"
            choices={[
              {
                label: 'Percentage off',
                id: 'percentageOff',
              },
              {
                label: 'Amount off',
                id: 'amountOff',
              },
              {
                label: 'Flat rate',
                id: 'flatRate',
              },
            ]}
            defaultValue={['percentageOff']}
            value={[discountType]}
            onChange={(e) => setDiscountType(typeof e === 'string' ? e : e[0])}
          />
        </Box>
        <Box>
          <InlineStack gap inlineAlignment="end" blockAlignment="end">
            <NumberField
              label="Delivery frequency"
              value={deliveryOptions.frequency}
              onChange={(value) => updateDeliveryOption('frequency', value)}
            />
            <Select
              label="Delivery interval"
              value={deliveryOptions.timeType}
              onChange={(value) => updateDeliveryOption('timeType', value)}
              options={[
                {value: 'weeks', label: 'Weeks'},
                {value: 'months', label: 'Months'},
                {value: 'years', label: 'Years'},
              ]}
            />
            <NumberField
              label={getDiscountLabel(discountType)}
              value={deliveryOptions.discount}
              onChange={(value) => updateDeliveryOption('discount', value)}
            />
          </InlineStack>
        </Box>
      </BlockStack>
    </AdminAction>
  );
}