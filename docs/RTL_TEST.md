# ‏בדיקת RTL עם אנגלית בתחילת שורה

‏`ChatGPT` הוא לקוח שיכול לעבוד עם `local MCP` ולדבר עם שרת מקומי.

‏`OpenAI` מאפשרת `plugins` שכוללים `local MCP apps` שרצים על המחשב.

‏`Node.js` מריץ את שרת ה־`MCP`, וה־`MCP Inspector` משמש לבדיקה מקומית.

‏`ChatGPT Desktop` → `local MCP` → `Node.js` → `local state`.

## ‏כותרת שמתחילה באנגלית

‏`ChatGPT Desktop` מתחבר ל־`MCP Inspector` דרך כלי `MCP` מקומיים.

- ‏`ping` עובד.
- ‏`add` מקבל `arguments` מובנים.
- ‏`set_value` ו־`get_value` שומרים וקוראים `state` מקומי.

1. ‏`ChatGPT` קורא לכלי הראשון.
2. ‏`ChatGPT` מקבל תוצאה.
3. ‏`ChatGPT` מחליט איזה כלי לקרוא אחר כך.

> ‏`OpenAI` בתחילת blockquote עדיין אמור להופיע כחלק מפסקה `RTL` תקינה.

אם כל השורות במסמך הזה מוצגות נכון ב־GitHub, הכלל שניישם הוא: להוסיף סימן `RLM` (`U+200F`) בתחילת כל שורת Markdown עברית, אחרי סימן הכותרת/רשימה/ציטוט, ולהמשיך לבודד מונחים לטיניים עם `backticks`.
