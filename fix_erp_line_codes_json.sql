-- Fix ERPLineCode values using JSON_VALUE (SQL Server 2016+)
-- This script properly parses JSON responses to extract the value

-- First, let's see what we have
SELECT Id, ERPLineCode, 
       CASE 
           WHEN ISJSON(ERPLineCode) = 1 THEN 'Valid JSON'
           ELSE 'Not JSON'
       END AS JsonStatus
FROM dbo.Lignes 
WHERE ERPLineCode IS NOT NULL;

-- Update using proper JSON parsing
UPDATE dbo.Lignes 
SET ERPLineCode = JSON_VALUE(ERPLineCode, '$.value'),
    UpdatedAt = GETUTCDATE()
WHERE ERPLineCode IS NOT NULL 
  AND ISJSON(ERPLineCode) = 1
  AND JSON_VALUE(ERPLineCode, '$.value') IS NOT NULL;

-- Verify the results
SELECT Id, ERPLineCode, UpdatedAt 
FROM dbo.Lignes 
WHERE ERPLineCode IS NOT NULL
ORDER BY UpdatedAt DESC; 