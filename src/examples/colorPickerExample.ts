import colorPicker from '../prompts/colorPicker.js';

async function main() {
  const color = await colorPicker({
    message: 'Choose a color:'
  });

  console.log('Selected color:', color);
}

main().catch(console.error); 