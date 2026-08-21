from models_logic.entity_extractor import ProductEntityExtractor


extractor = ProductEntityExtractor()


products = [
    '3M 775L Stikit Film P150 - Cubitron II 50 Disc/Box',
    'DBD090094101F Diablo 9" - Metal Cut-Off Disc',
    'DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc'
]


for product in products:

    print("\nPRODUCT:")
    print(product)

    print("\nEXTRACTED:")
    print(extractor.extract(product))