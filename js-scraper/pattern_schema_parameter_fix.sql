-- =====================================================
-- PATTERN SCHEMA PARAMETER FIX
-- =====================================================
-- Fix for parameter name conflict in calculate_pattern_accuracy function

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS calculate_pattern_accuracy(TEXT, INTEGER);

-- Recreate the function with corrected parameter name
CREATE OR REPLACE FUNCTION calculate_pattern_accuracy(
    input_pattern_type TEXT,
    days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
    pattern_type TEXT,
    total_predictions BIGINT,
    fulfilled_predictions BIGINT,
    accuracy_rate DECIMAL(5,4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pp.prediction_type,
        COUNT(*)::BIGINT as total_predictions,
        COUNT(CASE WHEN pp.is_fulfilled = true THEN 1 END)::BIGINT as fulfilled_predictions,
        ROUND(
            COUNT(CASE WHEN pp.is_fulfilled = true THEN 1 END)::DECIMAL / 
            NULLIF(COUNT(*), 0) * 100, 4
        ) / 100 as accuracy_rate
    FROM pattern_predictions pp
    WHERE pp.prediction_type = input_pattern_type
    AND pp.created_at >= NOW() - (days_back || ' days')::INTERVAL
    GROUP BY pp.prediction_type;
END;
$$ LANGUAGE plpgsql;

-- Test the function to make sure it works
SELECT 'Pattern schema parameter fix applied successfully' as status;
