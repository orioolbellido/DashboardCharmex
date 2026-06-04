-- Insertar marcas (NovaStar y Pixelhue)
INSERT INTO public.brands (id, name, manufacturer_code)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'NovaStar', 'NOV'),
    ('00000000-0000-0000-0000-000000000002', 'Pixelhue', 'PIX')
ON CONFLICT (name) DO NOTHING;

-- Insertar productos investigados (NovaStar MX40 Pro y Pixelhue Q8)
INSERT INTO public.products (id, brand_id, category, model, part_number, specifications, max_power_w, thermal_btu_h, rack_units)
VALUES 
    (
        '10000000-0000-0000-0000-000000000001', 
        '00000000-0000-0000-0000-000000000001', 
        'PROCESSOR', 
        'MX40 Pro', 
        'NOV-MX40-PRO', 
        '{
            "load_capacity_pixels": 9000000,
            "max_resolution": "8192 x 8192",
            "video_inputs": ["3x HDMI 2.0", "1x DP 1.2", "1x 12G-SDI"],
            "outputs": {
                "ethernet": 20,
                "optical_10g": 4
            },
            "color_depth": ["8-bit", "10-bit", "12-bit"],
            "layers": 4,
            "features": ["VMP Software", "Genlock", "HDR", "Low Latency < 1ms"]
        }'::jsonb, 
        95.0, 
        324.14, -- 95W * 3.412 = 324.14 BTU/h
        2
    ),
    (
        '20000000-0000-0000-0000-000000000001', 
        '00000000-0000-0000-0000-000000000002', 
        'SWITCHER', 
        'Q8', 
        'PIX-Q8-VPU', 
        '{
            "input_slots": 6,
            "output_slots": 4,
            "max_4k_inputs": 48,
            "max_4k_outputs": 16,
            "mixing_layers": 32,
            "video_formats": ["4K", "8K processing"],
            "connectivity": ["HDMI 2.0", "DP 1.2", "12G-SDI", "ST2110 IP"],
            "features": ["Switcher/Splicer Mode", "Optical Fiber 10km", "Dante 64x64", "Seamless Switching"]
        }'::jsonb, 
        800.0, -- Approx power for a heavy VPU switcher 
        2729.6, -- 800W * 3.412 = 2729.6 BTU/h
        4
    )
ON CONFLICT DO NOTHING;
