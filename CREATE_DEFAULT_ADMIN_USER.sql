SELECT 
    u.email,
    p.full_name,
    c.name as company_name,
    cu.role as company_role,
    cu.is_primary
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN company_users cu ON u.id = cu.user_id
LEFT JOIN companies c ON cu.company_id = c.id
WHERE u.id = 'f1c1befc-b508-4141-a56c-ec9926708985';