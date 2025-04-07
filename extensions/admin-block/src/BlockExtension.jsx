import {
  reactExtension,
  useApi,
  AdminBlock,
  BlockStack,
  Text,
  Button,
  Box,
  InlineStack,
  Select,
  TextField,
  Modal,
  Grid,
  Navigation,
  Divider,
  Icon,
  Badge,
} from '@shopify/ui-extensions-react/admin';
import {useState} from 'react';

const TARGET = 'admin.product-details.block.render';

export default reactExtension(TARGET, () => <App />);

const INPUT_TYPES = {
  RADIO: 'radio',
  MULTI_SELECT: 'multiSelect',
  TEXT: 'text',
  FILE: 'file'
};

const ITEMS_PER_PAGE = 5;

function App() {
  const {i18n, data} = useApi(TARGET);
  const [blocks, setBlocks] = useState([]);
  const [selectedInputType, setSelectedInputType] = useState(INPUT_TYPES.RADIO);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingOption, setEditingOption] = useState(null);
  const [currentBlock, setCurrentBlock] = useState(null);

  const addBlock = () => {
    const newBlock = {
      id: Date.now(),
      title: 'New Block',
      description: '',
      inputs: []
    };
    setBlocks([...blocks, newBlock]);
    setCurrentBlock(newBlock);
  };

  const updateBlock = (blockId, updates) => {
    setBlocks(blocks.map(block => 
      block.id === blockId ? {...block, ...updates} : block
    ));
  };

  const addInputToBlock = (inputType, inputData) => {
    if (!currentBlock) return;
    
    const newInput = {
      id: Date.now(),
      type: inputType,
      title: inputData.title,
      explanation: inputData.explanation,
      options: inputType === INPUT_TYPES.RADIO || inputType === INPUT_TYPES.MULTI_SELECT 
        ? [{
            id: Date.now(),
            title: '',
            description: '',
            priceAdjustment: 0,
            quantity: inputType === INPUT_TYPES.MULTI_SELECT ? 1 : undefined
          }]
        : undefined
    };

    updateBlock(currentBlock.id, {
      inputs: [...(currentBlock.inputs || []), newInput]
    });
    setShowAddModal(false);
  };

  const getInputsByType = (type) => {
    if (!currentBlock) return [];
    return currentBlock.inputs.filter(input => input.type === type);
  };

  const currentInputs = getInputsByType(selectedInputType);
  const totalPages = Math.ceil(currentInputs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleInputs = currentInputs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const renderInputTable = () => {
    return (
      <BlockStack gap="medium">
        <Box padding="base">
          <Grid columns={["20%", "30%", "30%", "20%"]}>
            <Text variant="headingSm">Title</Text>
            <Text variant="headingSm">Description</Text>
            <Text variant="headingSm">Options</Text>
            <Text variant="headingSm">Actions</Text>
          </Grid>
        </Box>
        {visibleInputs.map(input => (
          <Box key={input.id} border="base" padding="base">
            <Grid columns={["20%", "30%", "30%", "20%"]}>
              <Text>{input.title}</Text>
              <Text>{input.explanation}</Text>
              <Text>
                {input.options ? (
                  <Badge>{input.options.length} options</Badge>
                ) : (
                  <Text>-</Text>
                )}
              </Text>
              <Button
                onPress={() => setEditingOption(input)}
                kind="secondary"
              >
                Edit
              </Button>
            </Grid>
          </Box>
        ))}
      </BlockStack>
    );
  };

  return (
    <AdminBlock title="Bundle Builder">
      <BlockStack gap="large">
        <Box>
          <InlineStack align="space-between">
            <Text variant="headingMd">Bundle Configuration</Text>
            {!currentBlock ? (
              <Button onPress={addBlock}>Create Block</Button>
            ) : (
              <Button onPress={() => setShowAddModal(true)}>Add Input</Button>
            )}
          </InlineStack>
        </Box>

        {currentBlock && (
          <>
            <Box padding="base">
              <BlockStack gap="medium">
                <TextField
                  label="Block Title"
                  value={currentBlock.title}
                  onChange={(value) => updateBlock(currentBlock.id, {title: value})}
                />
                <TextField
                  label="Block Description"
                  value={currentBlock.description}
                  onChange={(value) => updateBlock(currentBlock.id, {description: value})}
                  multiline={3}
                />
              </BlockStack>
            </Box>

            <Box padding="base">
              <Select
                label="Input Type"
                value={selectedInputType}
                onChange={setSelectedInputType}
                options={[
                  {label: 'Radio Button', value: INPUT_TYPES.RADIO},
                  {label: 'Multi-Select', value: INPUT_TYPES.MULTI_SELECT},
                  {label: 'Text Box', value: INPUT_TYPES.TEXT},
                  {label: 'File Upload', value: INPUT_TYPES.FILE},
                ]}
              />
            </Box>

            {renderInputTable()}

            {totalPages > 1 && (
              <Box padding="base">
                <InlineStack align="center" spacing="base">
                  <Button
                    kind="secondary"
                    disabled={currentPage === 1}
                    onPress={() => setCurrentPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Text>Page {currentPage} of {totalPages}</Text>
                  <Button
                    kind="secondary"
                    disabled={currentPage === totalPages}
                    onPress={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </InlineStack>
              </Box>
            )}
          </>
        )}

        {showAddModal && (
          <Modal
            title="Add New Input"
            onClose={() => setShowAddModal(false)}
          >
            <BlockStack gap="medium">
              <TextField
                label="Input Title"
                onChange={(value) => setNewInput(prev => ({...prev, title: value}))}
              />
              <TextField
                label="Explanation"
                onChange={(value) => setNewInput(prev => ({...prev, explanation: value}))}
                multiline={2}
              />
              <Button
                onPress={() => addInputToBlock(selectedInputType, newInput)}
              >
                Add Input
              </Button>
            </BlockStack>
          </Modal>
        )}

        {editingOption && (
          <Modal
            title="Edit Input"
            onClose={() => setEditingOption(null)}
          >
            <OptionsList
              options={editingOption.options || []}
              isMultiSelect={editingOption.type === INPUT_TYPES.MULTI_SELECT}
              onUpdate={(options) => {
                const updatedInputs = currentBlock.inputs.map(input =>
                  input.id === editingOption.id ? {...input, options} : input
                );
                updateBlock(currentBlock.id, {inputs: updatedInputs});
                setEditingOption(null);
              }}
            />
          </Modal>
        )}
      </BlockStack>
    </AdminBlock>
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