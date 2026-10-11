# Local MCP POC

`POC` קטן ומבודד שמטרתו להוכיח את כל היכולות הטכניות שנצטרך בהמשך כדי לאפשר ל־`ChatGPT` לעבוד בלולאה עם כלים שרצים מקומית במחשב — בלי `OpenAI API` בתוך הקוד ובלי תלות ב־`Market Flow US`.

ה־`POC` **לא מבצע מסחר, לא מתחבר לשוק ולא נוגע בנתונים אמיתיים**. הוא בודק רק את שכבת החיבור וה־`tool calls`.

## מה ה־`POC` מוכיח

אחרי שנשלים את כל הבדיקות, נדע שהמסלול הבא עובד:

```text
ChatGPT / MCP client
        ↓
local MCP tool call
        ↓
Node.js process on this computer
        ↓
local computation / local state
        ↓
structured result
        ↓
ChatGPT can reason and call another tool
```

היכולות שנבדקות:

1. חיבור לשרת `MCP` מקומי.
2. גילוי `tools`.
3. שליחת `arguments` מובנים מהלקוח לשרת.
4. `computation` שמתבצע מקומית ולא בתוך המודל.
5. `state` שנכתב ונקרא מהמחשב.
6. כמה `tool calls` עוקבים באותה משימה.
7. העברת `payload` טקסטואלי בגודל משמעותי.
8. `tool` שאינו מסתיים מיד.
9. `failure` מכוון והחזרת `isError` תקינה.

---

# דרישות

## 1. `Node.js`

נדרש:

```text
Node.js 20+
```

בדיקה ב־`PowerShell` או `CMD`:

```powershell
node --version
npm --version
```

אם `node` אינו מוכר, התקן `Node.js LTS` ואז פתח `terminal` חדש.

## 2. `clone`

```powershell
git clone https://github.com/LirazShay/local-mcp-poc.git
cd local-mcp-poc
```

---

# התקנה

מתוך `root` של הריפו:

```powershell
npm install
```

אין צורך ב־`API key` ואין `.env`.

---

# בדיקה 1 — `unit tests`

הרץ:

```powershell
npm test
```

תוצאה צפויה: כל הטסטים עוברים.

הבדיקות מכסות את הלוגיקה המקומית של:

```text
add
analyze_numbers
inspect_payload
set_value/get_value
delay
```

---

# בדיקה 2 — `MCP Inspector`

זו הבדיקה הראשונה של `MCP` אמיתי.

הדרך הפשוטה ב־`Windows`:

```text
RUN_INSPECTOR.cmd
```

או ידנית:

```powershell
npm run inspect
```

הפקודה מפעילה את `MCP Inspector` ומבקשת ממנו להפעיל את שרת ה־`stdio` שלנו.

בחלון ה־`Inspector`:

1. התחבר לשרת אם נדרש ללחוץ `Connect`.
2. פתח `Tools`.
3. ודא שאתה רואה את הכלים הבאים:

```text
ping
add
set_value
get_value
analyze_numbers
inspect_payload
delay
fail_test
```

## בדיקות מומלצות בתוך `Inspector`

### `ping`

קרא:

```text
ping
```

תוצאה צפויה:

```json
{
  "ok": true,
  "server": "local-mcp-poc",
  "version": "1.0.0"
}
```

### `add`

`Arguments`:

```json
{
  "a": 17,
  "b": 25
}
```

תוצאה צפויה:

```json
{
  "a": 17,
  "b": 25,
  "result": 42
}
```

### `analyze_numbers`

`Arguments`:

```json
{
  "numbers": [3, 7, 1, 9, 4]
}
```

הממוצע הצפוי:

```text
4.8
```

### `state`

הרץ:

```text
set_value
```

עם:

```json
{
  "key": "champion",
  "value": "query-17"
}
```

אחר כך:

```text
get_value
```

עם:

```json
{
  "key": "champion"
}
```

הערך הצפוי:

```text
query-17
```

ה־`state` נשמר מקומית ב:

```text
.local/state.json
```

התיקייה מוחרגת מ־`Git`.

לאיפוס:

```text
RESET_STATE.cmd
```

### `failure`

קרא:

```text
fail_test
```

תוצאה צפויה: `tool result` שמסומן ככשל ומכיל:

```text
POC_TEST_ERROR
```

המטרה היא לוודא שכשל של `tool` אינו מפיל את שרת ה־`MCP` כולו.

### `delay`

`Arguments`:

```json
{
  "ms": 1500
}
```

תוצאה צפויה:

```json
{
  "waitedMs": 1500
}
```

הכלי מוגבל במכוון ל־5 שניות כדי שה־`POC` יישאר בטוח ומהיר.

### `payload`

`inspect_payload` אינו מחזיר את הטקסט עצמו אלא רק `metadata` שלו:

```text
utf8Bytes
characters
sha256
```

אפשר להדביק טקסט גדול ולוודא שה־`round trip` עובד בלי להציף את התשובה באותו `payload`.

---

# הפעלת השרת ידנית

אפשר להריץ:

```text
START_SERVER.cmd
```

או:

```powershell
npm start
```

תראה הודעה בסגנון:

```text
local-mcp-poc MCP server is running on stdio
```

ואז התהליך ייראה כאילו הוא "מחכה". זה תקין.

שרת `stdio` לא מאזין על `port`. הוא מחכה ש־`MCP host` יפעיל אותו ויתקשר איתו דרך `stdin/stdout`.

חשוב: `stdout` שייך לפרוטוקול `MCP`. לכן `logging` של השרת נעשה ל־`stderr` באמצעות `console.error`, ולא באמצעות `console.log`.

---

# חיבור ל־`ChatGPT Desktop`

## הערה חשובה על זמינות

`OpenAI` מאפשרת `plugins` שכוללים `local MCP apps` שרצים על המחשב, אך השימוש בכלי `local` כאלה הוא ב־`ChatGPT Desktop`. זמינות מדויקת של `Plugin Creator` ושל `local apps` תלויה בתוכנית, ב־`rollout` ובהרשאות החשבון או ה־`Workspace`.

לכן קודם מוכיחים את השרת עם `MCP Inspector`. רק לאחר שהוא עובד עוברים לחיבור `ChatGPT`.

## הדרך המומלצת

1. פתח `ChatGPT Desktop` ב־`Windows`.
2. פתח `Plugins`.
3. התקן או פתח `Plugin Creator` אם הוא זמין אצלך.
4. בקש ממנו ליצור `plugin` מקומי שמפעיל `MCP server` מסוג `stdio` מתוך הריפו הזה.
5. תן לו את פקודת ההפעלה:

```text
npx tsx src/index.ts
```

וה־`working directory` צריך להיות ה־`root` המקומי של:

```text
local-mcp-poc
```

אם ה־`UI` של `Plugin Creator` מאפשר לבחור תיקייה או `command`, בחר את הנתיב המקומי של `clone` הריפו ואת הפקודה לעיל.

> לא מכניסים לריפו `absolute path` של המחשב שלך, כי הוא שונה ממחשב למחשב.

לאחר שה־`plugin` נוצר, פתח `chat` חדש והפעל או בחר אותו באמצעות `@` או דרך רשימת `plugins`, בהתאם ל־`UI` שמופיע אצלך.

---

# בדיקת `ChatGPT` החשובה ביותר — `multi-step loop`

לא מספיק לבדוק `ping`. המטרה היא להוכיח ש־`ChatGPT` מסוגל לקבל תוצאה מכלי אחד, לחשוב עליה, ואז לבחור ולקרוא לכלי אחר.

לאחר שה־`plugin` המקומי מחובר, שלח ל־`ChatGPT` את ההודעה הבאה:

```text
השתמש בכלים של local-mcp-poc ובצע את כל השלבים בעצמך:

1. בדוק ping.
2. חשב 17 + 25 בעזרת add.
3. נתח את המספרים [3,7,1,9,4] בעזרת analyze_numbers.
4. בחר בעצמך מספר שלם שגדול מהממוצע שקיבלת.
5. שמור אותו תחת key בשם chosen באמצעות set_value.
6. קרא את chosen חזרה באמצעות get_value.
7. הפעל fail_test, הבן שזה כשל מכוון, ואל תעצור בגלל הכשל.
8. לאחר הכשל קרא שוב ping כדי להוכיח שהשרת עדיין עובד.
9. בסוף סכם אילו tool calls ביצעת ומה הוכח בכל שלב.
```

## `PASS`

הבדיקה עוברת רק אם ניתן לראות בפועל רצף דומה ל:

```text
ping
  ↓
add
  ↓
analyze_numbers
  ↓
ChatGPT chooses a value based on returned average
  ↓
set_value
  ↓
get_value
  ↓
fail_test → expected error
  ↓
ping → still healthy
```

הנקודה המרכזית היא שהערך שנשמר בשלב 5 צריך להיבחר **אחרי** שהמודל קיבל את תוצאת `analyze_numbers`. כלומר זו אינה רשימת `tool calls` קבועה מראש; יש `dependency` בין סבבים.

---

# בדיקת `payload` דרך `ChatGPT`

אפשר לבקש:

```text
צור טקסט מקומי של בערך 20,000 תווים ושלח אותו ל-inspect_payload. אל תחזיר לי את כל הטקסט; החזר רק את ה-utf8Bytes, characters וה-sha256 שהכלי החזיר.
```

אם זה עובד, הוכחנו שניתן להעביר ל־`tool` נתון `payload` משמעותי ולקבל `summary` קטן בחזרה.

אין צורך להתחיל מ־`100KB`. אם `20KB` עובר, אפשר להגדיל בהדרגה ל־`50KB` ואז ל־`100KB` כדי לבדוק את הגבולות בפועל בחשבון או ב־`host` שלך.

---

# מה לא נבדק עדיין

גם אם כל ה־`POC` עובר, הוא עדיין לא מוכיח:

```text
DuckDB
Market Flow US schema
Scanner SQL
market replay
large historical datasets
long autonomous research sessions
OpenAI API
automatic trading
```

וזה בכוונה.

ה־`POC` מוכיח רק את ה־`boundary` הטכני:

```text
model ↔ MCP ↔ local Node.js ↔ local computation/state
```

אם הגבול הזה עובד, אפשר בשלב הבא להחליף בהדרגה את ה־`toy tools` בכלים אמיתיים כגון:

```text
evaluate_sql
compare_candidates
get_failures
get_missed_winners
save_experiment
```

בלי לשנות את עקרון התקשורת.

---

# מבנה הריפו

```text
local-mcp-poc/
├─ src/
│  ├─ index.ts       # MCP server + tool registration
│  └─ poc.ts         # local logic/state helpers
├─ test/
│  └─ poc.test.ts
├─ .github/workflows/ci.yml
├─ .gitignore
├─ package.json
├─ tsconfig.json
├─ START_SERVER.cmd
├─ RUN_INSPECTOR.cmd
├─ RESET_STATE.cmd
└─ README.md
```

---

# פתרון תקלות

## `node` אינו מזוהה

`Node.js` אינו מותקן או שה־`terminal` הישן לא קיבל את ה־`PATH` החדש.

סגור ופתח `terminal` חדש לאחר התקנת `Node.js`.

## ה־`Inspector` לא רואה `tools`

הרץ קודם:

```powershell
npm test
```

אחר כך:

```powershell
npm run inspect
```

ודא שאתה מריץ מתוך ה־`root` של `local-mcp-poc`.

## השרת נסגר מיד

הרץ:

```powershell
npm start
```

אם יש `stack trace`, שמור אותו. אם מופיעה רק הודעת `running on stdio` והחלון נשאר פתוח — זה מצב תקין.

## `state` ישן מפריע לבדיקה

הרץ:

```text
RESET_STATE.cmd
```

או מחק ידנית:

```text
.local/state.json
```

## `ChatGPT` לא מציג `local tools`

קודם ודא שה־`Inspector` עובד. אם ה־`Inspector` עובד אבל `ChatGPT` לא מציג את הכלים, הבעיה היא בשלב ה־`registration/plugin` ולא בשרת עצמו.

בדוק שאתה משתמש ב־`ChatGPT Desktop` ושהחשבון שלך מציג `Plugin Creator` או יכולת `local MCP`. ה־`UI` והזמינות עשויים להשתנות לפי ה־`plan` וה־`rollout`.

---

# קריטריוני הצלחה סופיים

ה־`POC` נחשב מוצלח כאשר:

- `npm test` ירוק;
- ה־`Inspector` מציג את כל שמונת הכלים;
- `ping` עובד;
- `structured arguments` עובדים ב־`add`;
- `local computation` עובד ב־`analyze_numbers`;
- `set_value` ואחריו `get_value` מוכיחים `persistence`;
- `inspect_payload` מקבל `payload` משמעותי;
- `delay` עובד;
- `fail_test` נכשל בצורה צפויה והשרת נשאר פעיל;
- `ChatGPT` מבצע `multi-step sequence` שבו `tool call` מאוחר תלוי בתוצאה של `tool call` מוקדם יותר.

רק אחרי שכל אלה עוברים יש טעם לחבר את אותו `pattern` ל־`Market Flow US`.