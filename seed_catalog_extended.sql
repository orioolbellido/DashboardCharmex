-- Ampliación de catálogo: NovaStar COEX y Pixelhue VPU
-- Ejecutar en Supabase SQL Editor

-- 1. Insertar Marcas (asegurando que existan)
INSERT INTO public.brands (id, name, manufacturer_code)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'NovaStar', 'NOV'),
    ('00000000-0000-0000-0000-000000000002', 'Pixelhue', 'PIX')
ON CONFLICT (name) DO NOTHING;

-- 2. Asegurarse de que existan categorías
INSERT INTO public.categories (id, name)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'Procesador LED'),
    ('c0000000-0000-0000-0000-000000000002', 'Matriz de Conmutación'),
    ('c0000000-0000-0000-0000-000000000003', 'Consola de Control'),
    ('c0000000-0000-0000-0000-000000000004', 'Media Server')
ON CONFLICT (name) DO NOTHING;

-- 3. Insertar Productos de NOVASTAR COEX
INSERT INTO public.products (id, brand_id, category_id, model, max_pixel_capacity, max_width_limit, max_height_limit, rack_units, power_consumption_watts, software_compatibility, technical_specs)
VALUES 
    -- NovaStar MX40 Pro (Ya lo teníamos pero lo actualizamos con formato nuevo)
    (
        '10000000-0000-0000-0000-000000000001', 
        '00000000-0000-0000-0000-000000000001', 
        'c0000000-0000-0000-0000-000000000001', 
        'MX40 Pro', 
        9000000, 8192, 8192, 2, 95, 'VMP',
        '{"inputs": ["3x HDMI 2.0", "1x DP 1.2", "1x 12G-SDI"], "outputs": ["20x 1G Ethernet", "4x 10G OPT"], "layers": 4, "features": ["HDR", "Genlock", "Low Latency"]}'::jsonb
    ),
    -- NovaStar MX30
    (
        '10000000-0000-0000-0000-000000000002', 
        '00000000-0000-0000-0000-000000000001', 
        'c0000000-0000-0000-0000-000000000001', 
        'MX30', 
        6500000, 8192, 8192, 2, 70, 'VMP',
        '{"inputs": ["1x HDMI 2.0", "1x HDMI 1.4", "1x DP 1.1", "2x 3G-SDI"], "outputs": ["10x 1G Ethernet", "2x 10G OPT"], "layers": 3, "features": ["Color Correction"]}'::jsonb
    ),
    -- NovaStar MX20
    (
        '10000000-0000-0000-0000-000000000003', 
        '00000000-0000-0000-0000-000000000001', 
        'c0000000-0000-0000-0000-000000000001', 
        'MX20', 
        3900000, 4096, 4096, 2, 50, 'VMP',
        '{"inputs": ["2x HDMI 1.3", "1x 3G-SDI"], "outputs": ["6x 1G Ethernet", "2x 10G OPT"], "layers": 3, "features": ["Grayscale Calibration"]}'::jsonb
    ),
    -- NovaStar KU20
    (
        '10000000-0000-0000-0000-000000000004', 
        '00000000-0000-0000-0000-000000000001', 
        'c0000000-0000-0000-0000-000000000001', 
        'KU20', 
        3900000, 4096, 4096, 1, 35, 'VMP',
        '{"inputs": ["1x HDMI 1.3"], "outputs": ["6x 1G Ethernet", "1x 10G OPT"], "layers": 1, "features": ["0-Frame Latency"]}'::jsonb
    )
ON CONFLICT (model) DO UPDATE 
SET technical_specs = EXCLUDED.technical_specs, max_pixel_capacity = EXCLUDED.max_pixel_capacity;

-- 4. Insertar Productos de PIXELHUE
INSERT INTO public.products (id, brand_id, category_id, model, max_pixel_capacity, max_width_limit, max_height_limit, rack_units, power_consumption_watts, software_compatibility, technical_specs)
VALUES 
    -- Pixelhue Q8 (Switcher Modular)
    (
        '20000000-0000-0000-0000-000000000001', 
        '00000000-0000-0000-0000-000000000002', 
        'c0000000-0000-0000-0000-000000000002', 
        'Q8 Seamless Switcher', 
        null, 8192, 8192, 4, 800, 'PixelFlow',
        '{"slots": "6x Inputs, 4x Outputs", "max_4k_concurrent": 48, "mixing_layers": 32, "features": ["VPU Architecture", "Dante Audio", "8K processing"]}'::jsonb
    ),
    -- Pixelhue X400 (Media Server)
    (
        '20000000-0000-0000-0000-000000000002', 
        '00000000-0000-0000-0000-000000000002', 
        'c0000000-0000-0000-0000-000000000004', 
        'X400 Media Server', 
        null, 8192, 8192, 4, 1200, 'PixelFlow',
        '{"outputs": ["6x 4K or 24x 2K"], "features": ["Hardware 8K Decoding", "Multiple 4K@60fps Playback", "Server-class Hardware"]}'::jsonb
    ),
    -- Pixelhue U5 (Event Controller)
    (
        '20000000-0000-0000-0000-000000000003', 
        '00000000-0000-0000-0000-000000000002', 
        'c0000000-0000-0000-0000-000000000003', 
        'U5 Event Controller', 
        null, null, null, 0, 150, 'PixelFlow',
        '{"interface": ["21.5-inch Main Touchscreen", "8-inch Smart Touchscreen", "87 LCD Buttons", "T-Bar"], "features": ["Timecode Generation", "MIDI Control"]}'::jsonb
    )
ON CONFLICT (model) DO UPDATE 
SET technical_specs = EXCLUDED.technical_specs;
