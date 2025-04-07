import {
  reactExtension,
  useApi,
  BlockStack,
  Text,
  Button,
  Box,
  InlineStack,
  Select,
  TextField,
  ChoiceList,
  Checkbox,
  Divider,
} from '@shopify/ui-extensions-react/admin';
import {useState, useEffect} from 'react';

// The target used here must match the target used in the extension's toml file (./shopify.extension.toml)
export default reactExtension('admin.product-details.configuration.render', () => <App />);

const INPUT_TYPES = {
  RADIO: 'radio',
  MULTI_SELECT: 'multiSelect',
  TEXT: 'text',
  FILE: 'file'
};

function App() {
  const {extension: {target}, i18n} = useApi();
  const [blocks, setBlocks] = useState([]);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  
  const addBlock = () => {
    setBlocks([...blocks, {
      id: Date.now(),
      title: 'New Block',
      description: '',
      inputs: []
    }]);
  };

  const updateBlock = (blockId, updates) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? {...block, ...updates} : block
    ));
  };

  const addInputToBlock = (blockId, inputType) => {
    setBlocks(blocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          inputs: [...block.inputs, createNewInput(inputType)]
        };
      }
      return block;
    }));
  };

  const updateInput = (blockId, inputId, updates) => {
    setBlocks(blocks.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          inputs: block.inputs.map(input => 
            input.id === inputId ? {...input, ...updates} : input
          )
        };
      }
      return block;
    }));
  };

  const createNewInput = (type) => {
    const baseInput = {
      id: Date.now(),
      type,
      title: '',
      explanation: '',
    };

    switch (type) {
      case INPUT_TYPES.RADIO:
      case INPUT_TYPES.MULTI_SELECT:
        return {
          ...baseInput,
          options: [{
            id: Date.now(),
            title: '',
            description: '',
            priceAdjustment: 0,
            quantity: type === INPUT_TYPES.MULTI_SELECT ? 1 : undefined
          }]
        };
      case INPUT_TYPES.TEXT:
      case INPUT_TYPES.FILE:
        return baseInput;
      default:
        return baseInput;
    }
  };

  return (
    <BlockStack gap="large">
      <Box>
        <InlineStack align="space-between">
          <Text variant="headingMd">Bundle Configuration</Text>
          <Button onPress={addBlock}>Add Block</Button>
        </InlineStack>
      </Box>

      {blocks.map(block => (
        <Box key={block.id} border="base" padding="base">
          <BlockStack gap="medium">
            <TextField
              label="Block Title"
              value={block.title}
              onChange={(value) => updateBlock(block.id, {title: value})}
            />
            <TextField
              label="Block Description"
              value={block.description}
              onChange={(value) => updateBlock(block.id, {description: value})}
              multiline={3}
            />
            
            <Divider />
            
            <Box>
              <InlineStack align="space-between">
                <Text variant="headingSm">Input Fields</Text>
                <Select
                  label="Add Input"
                  options={[
                    {label: 'Radio Button', value: INPUT_TYPES.RADIO},
                    {label: 'Multi-Select', value: INPUT_TYPES.MULTI_SELECT},
                    {label: 'Text Box', value: INPUT_TYPES.TEXT},
                    {label: 'File Upload', value: INPUT_TYPES.FILE},
                  ]}
                  onChange={(value) => addInputToBlock(block.id, value)}
                  placeholder="Add Input Type"
                />
              </InlineStack>
            </Box>

            <BlockStack gap="medium">
              {block.inputs.map(input => (
                <Box key={input.id} border="base" padding="base" background="surface-subdued">
                  <BlockStack gap="medium">
                    <TextField
                      label="Input Title"
                      value={input.title}
                      onChange={(value) => updateInput(block.id, input.id, {title: value})}
                    />
                    <TextField
                      label="Explanation"
                      value={input.explanation}
                      onChange={(value) => updateInput(block.id, input.id, {explanation: value})}
                      multiline={2}
                    />

                    {(input.type === INPUT_TYPES.RADIO || input.type === INPUT_TYPES.MULTI_SELECT) && (
                      <OptionsList
                        options={input.options}
                        isMultiSelect={input.type === INPUT_TYPES.MULTI_SELECT}
                        onUpdate={(options) => updateInput(block.id, input.id, {options})}
                      />
                    )}
                  </BlockStack>
                </Box>
              ))}
            </BlockStack>
          </BlockStack>
        </Box>
      ))}
    </BlockStack>
  );
}

function OptionsList({options, isMultiSelect, onUpdate}) {
  const addOption = () => {
    onUpdate([...options, {
      id: Date.now(),
      title: '',
      description: '',
      priceAdjustment: 0,
      quantity: isMultiSelect ? 1 : undefined
    }]);
  };

  const updateOption = (optionId, updates) => {
    onUpdate(options.map(option =>
      option.id === optionId ? {...option, ...updates} : option
    ));
  };

  return (
    <BlockStack gap="medium">
      <InlineStack align="space-between">
        <Text variant="headingSm">Options</Text>
        <Button onPress={addOption}>Add Option</Button>
      </InlineStack>

      {options.map(option => (
        <Box key={option.id} border="base" padding="base">
          <BlockStack gap="medium">
            <TextField
              label="Option Title"
              value={option.title}
              onChange={(value) => updateOption(option.id, {title: value})}
            />
            <TextField
              label="Description"
              value={option.description}
              onChange={(value) => updateOption(option.id, {description: value})}
              multiline={2}
            />
            <TextField
              label="Price Adjustment"
              type="number"
              value={option.priceAdjustment.toString()}
              onChange={(value) => updateOption(option.id, {priceAdjustment: parseFloat(value) || 0})}
              prefix="$"
            />
            {isMultiSelect && (
              <TextField
                label="Default Quantity"
                type="number"
                value={option.quantity.toString()}
                onChange={(value) => updateOption(option.id, {quantity: parseInt(value) || 1})}
                min={1}
              />
            )}
          </BlockStack>
        </Box>
      ))}
    </BlockStack>
  );
}