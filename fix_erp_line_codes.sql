-- Fix ERPLineCode values that contain raw JSON responses
-- This script extracts the clean line code value from JSON responses

UPDATE dbo.Lignes 
SET ERPLineCode = CASE 
    WHEN ERPLineCode LIKE '%"value":%' AND ERPLineCode LIKE '%@odata.context%' THEN
        -- Extract the value from JSON like {"@odata.context":"...","value":1000}
        REPLACE(REPLACE(SUBSTRING(ERPLineCode, 
            CHARINDEX('"value":', ERPLineCode) + 8, 
            CHARINDEX('}', ERPLineCode) - CHARINDEX('"value":', ERPLineCode) - 8), '"', ''), ' ', '')
    ELSE 
        ERPLineCode -- Keep unchanged if not JSON
END,
UpdatedAt = GETUTCDATE()
WHERE ERPLineCode IS NOT NULL 
  AND ERPLineCode LIKE '%@odata.context%'
  AND ERPLineCode LIKE '%"value":%';

-- Show the results after update
SELECT Id, ERPLineCode, UpdatedAt 
FROM dbo.Lignes 
WHERE ERPLineCode IS NOT NULL
ORDER BY UpdatedAt DESC; 