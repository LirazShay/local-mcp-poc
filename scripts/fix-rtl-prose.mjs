import fs from 'node:fs';

const RLM = '\u200F';

const readmePath = 'README.md';
let readme = fs.readFileSync(readmePath, 'utf8');

const oldPrompt = `> ${RLM}השתמש בכלים של \`local-mcp-poc\` ובצע את כל השלבים בעצמך:
>
> 1. ${RLM}בדוק \`ping\`.
> 2. ${RLM}חשב \`17 + 25\` בעזרת \`add\`.
> 3. ${RLM}נתח את המספרים \`[3,7,1,9,4]\` בעזרת \`analyze_numbers\`.
> 4. ${RLM}בחר בעצמך מספר שלם שגדול מהממוצע שקיבלת.
> 5. ${RLM}שמור אותו תחת \`key\` בשם \`chosen\` באמצעות \`set_value\`.
> 6. ${RLM}קרא את \`chosen\` חזרה באמצעות \`get_value\`.
> 7. ${RLM}הפעל \`fail_test\`, הבן שזה כשל מכוון, ואל תעצור בגלל הכשל.
> 8. ${RLM}לאחר הכשל קרא שוב \`ping\` כדי להוכיח שהשרת עדיין עובד.
> 9. ${RLM}בסוף סכם אילו \`tool calls\` ביצעת ומה הוכח בכל שלב.`;

const newPrompt = `${RLM}השתמש בכלים של \`local-mcp-poc\` ובצע את כל השלבים בעצמך:

1. ${RLM}בדוק \`ping\`.
2. ${RLM}חשב \`17 + 25\` בעזרת \`add\`.
3. ${RLM}נתח את המספרים \`[3,7,1,9,4]\` בעזרת \`analyze_numbers\`.
4. ${RLM}בחר בעצמך מספר שלם שגדול מהממוצע שקיבלת.
5. ${RLM}שמור אותו תחת \`key\` בשם \`chosen\` באמצעות \`set_value\`.
6. ${RLM}קרא את \`chosen\` חזרה באמצעות \`get_value\`.
7. ${RLM}הפעל \`fail_test\`, הבן שזה כשל מכוון, ואל תעצור בגלל הכשל.
8. ${RLM}לאחר הכשל קרא שוב \`ping\` כדי להוכיח שהשרת עדיין עובד.
9. ${RLM}בסוף סכם אילו \`tool calls\` ביצעת ומה הוכח בכל שלב.`;

const oldPayload = `> ${RLM}צור טקסט מקומי של בערך \`20,000\` תווים ושלח אותו ל־\`inspect_payload\`. אל תחזיר לי את כל הטקסט; החזר רק את \`utf8Bytes\`, \`characters\` וה־\`sha256\` שהכלי החזיר.`;
const newPayload = `${RLM}צור טקסט מקומי של בערך \`20,000\` תווים ושלח אותו ל־\`inspect_payload\`. אל תחזיר לי את כל הטקסט; החזר רק את \`utf8Bytes\`, \`characters\` וה־\`sha256\` שהכלי החזיר.`;

if (!readme.includes(oldPrompt)) throw new Error('README prompt block not found');
if (!readme.includes(oldPayload)) throw new Error('README payload block not found');
readme = readme.replace(oldPrompt, newPrompt).replace(oldPayload, newPayload);
fs.writeFileSync(readmePath, readme, 'utf8');

const promptPath = 'docs/CHATGPT_TEST_PROMPT.md';
const promptDoc = `# ${RLM}בדיקת \`ChatGPT\` רב־שלבית

${RLM}לאחר שה־\`local MCP plugin\` מחובר ב־\`ChatGPT Desktop\`, שלח את ההודעה הבאה כפי שהיא:

${RLM}השתמש בכלים של \`local-mcp-poc\` ובצע את כל השלבים בעצמך:

1. ${RLM}בדוק \`ping\`.
2. ${RLM}חשב \`17 + 25\` בעזרת \`add\`.
3. ${RLM}נתח את המספרים \`[3,7,1,9,4]\` בעזרת \`analyze_numbers\`.
4. ${RLM}בחר בעצמך מספר שלם שגדול מהממוצע שקיבלת.
5. ${RLM}שמור אותו תחת \`key\` בשם \`chosen\` באמצעות \`set_value\`.
6. ${RLM}קרא את \`chosen\` חזרה באמצעות \`get_value\`.
7. ${RLM}הפעל \`fail_test\`, הבן שזה כשל מכוון, ואל תעצור בגלל הכשל.
8. ${RLM}לאחר הכשל קרא שוב \`ping\` כדי להוכיח שהשרת עדיין עובד.
9. ${RLM}בסוף סכם אילו \`tool calls\` ביצעת ומה הוכח בכל שלב.

## \`PASS\`

${RLM}הבדיקה עוברת כאשר \`tool call\` מאוחר תלוי בתוצאה שחזרה מ־\`tool call\` מוקדם יותר, ה־\`state\` נקרא חזרה בהצלחה, והשרת ממשיך לעבוד לאחר \`fail_test\`.
`;
fs.writeFileSync(promptPath, promptDoc, 'utf8');
