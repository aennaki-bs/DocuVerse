codeunit 50000 "API Create and POst Doc"
{
    procedure CreateDoc(TierTYpe: integer; Type: Integer; CustVendoNo: code[20]; DocumentDate: Date; PostingDate: Date; ResponsabilityCentre: code[20]; ExternalDocNo: code[35]): Code[20]
    var
        SalesHeader: Record "Sales Header";
        PurchaseHeader: Record "Purchase Header";
    begin
        case TierTYpe of
            1:
                begin
                    SalesHeader.Init();
                    case Type of
                        0:
                            SalesHeader."Document Type" := SalesHeader."Document Type"::Quote;
                        1:
                            SalesHeader."Document Type" := SalesHeader."Document Type"::Order;
                        2:
                            SalesHeader."Document Type" := SalesHeader."Document Type"::Invoice;
                        3:
                            SalesHeader."Document Type" := SalesHeader."Document Type"::"Credit Memo";
                        4:
                            SalesHeader."Document Type" := SalesHeader."Document Type"::"Blanket Order";
                        5:
                            SalesHeader."Document Type" := SalesHeader."Document Type"::"Return Order";
                    end;
                    SalesHeader.Insert(true);

                    SalesHeader.Validate("Sell-to Customer No.", CustVendoNo);
                    SalesHeader.Validate("Document Date", DocumentDate);
                    SalesHeader.Validate("Posting Date", PostingDate);
                    SalesHeader.Validate("Responsibility Center", ResponsabilityCentre);
                    SalesHeader.Validate("External Document No.", ExternalDocNo);
                    SalesHeader.Modify();

                    exit(SalesHeader."No.");
                end;
            2:
                begin

                    PurchaseHeader.Init();
                    case Type of
                        10:
                            PurchaseHeader."Document Type" := PurchaseHeader."Document Type"::Quote;
                        11:
                            PurchaseHeader."Document Type" := PurchaseHeader."Document Type"::Order;
                        12:
                            PurchaseHeader."Document Type" := PurchaseHeader."Document Type"::Invoice;
                        13:
                            PurchaseHeader."Document Type" := PurchaseHeader."Document Type"::"Credit Memo";
                        14:
                            PurchaseHeader."Document Type" := PurchaseHeader."Document Type"::"Blanket Order";
                        15:
                            PurchaseHeader."Document Type" := PurchaseHeader."Document Type"::"Return Order";
                    end;
                    PurchaseHeader.Insert(true);

                    PurchaseHeader.Validate("Sell-to Customer No.", CustVendoNo);
                    PurchaseHeader.Validate("Document Date", DocumentDate);
                    PurchaseHeader.Validate("Posting Date", PostingDate);
                    PurchaseHeader.Validate("Responsibility Center", ResponsabilityCentre);
                    PurchaseHeader.Validate("Vendor Order No.", ExternalDocNo);
                    PurchaseHeader.Modify();

                    exit(PurchaseHeader."No.");
                end;
        end;
    end;


    procedure CreateDocLine(TierTYpe: integer; DocType: Integer; DocNo: code[20]; Type: integer; CodeLine: code[20]; DescriptionLine: Text[100]; locationCOde: code[20]; Qty: Decimal; UniteOfMeasure: code[20]; UnitpriceCOst: Decimal; DiscountAmt: Decimal): Integer
    var
        SalesLine: Record "Sales Line";
        PurchaseLine: Record "Purchase Line";
        SalesLine2: Record "Sales Line";
        PurchaseLine2: Record "Purchase Line";
        LineNo: Integer;
        SDocTYpe: enum "Sales Document Type";
        PDocTYpe: enum "Purchase Document Type";
    begin
        case TierTYpe of
            1:
                begin
                    case DocType of
                        0:
                            SDocTYpe := SDocTYpe::Quote;
                        1:
                            SDocTYpe := SDocTYpe::Order;
                        2:
                            SDocTYpe := SDocTYpe::Invoice;
                        3:
                            SDocTYpe := SDocTYpe::"Credit Memo";
                        4:
                            SDocTYpe := SDocTYpe::"Blanket Order";
                        5:
                            SDocTYpe := SDocTYpe::"Return Order";
                    end;

                    SalesLine2.Reset();
                    SalesLine2.SetRange("Document Type", SDocTYpe);
                    SalesLine2.SetRange("Document No.", DocNo);
                    if SalesLine2.FindLast() then
                        LineNo := SalesLine2."Line No." + 1000
                    else
                        LineNo := 1000;

                    SalesLine.Init();
                    SalesLine."Document Type" := SDocTYpe;
                    SalesLine."Document No." := DocNo;
                    SalesLine."Line No." := LineNo;
                    SalesLine.Insert();

                    case Type of
                        1:
                            SalesLine.Validate(Type, SalesLine.Type::"G/L Account");
                        2:
                            SalesLine.Validate(Type, SalesLine.Type::Item);
                    end;
                    SalesLine.Validate("No.", CodeLine);
                    SalesLine.Validate(Description, DescriptionLine);
                    SalesLine.Validate("Location Code", locationCOde);
                    SalesLine.Validate(Quantity, Qty);
                    SalesLine.Validate("Unit of Measure Code", UniteOfMeasure);
                    SalesLine.Validate("Unit Price", UnitpriceCOst);
                    SalesLine.Validate("Line Discount Amount", DiscountAmt);
                    SalesLine.Modify();

                    exit(SalesLine."Line No.");

                end;
            2:
                begin
                    case DocType of
                        10:
                            PDocTYpe := PDocTYpe::Quote;
                        11:
                            PDocTYpe := PDocTYpe::Order;
                        12:
                            PDocTYpe := PDocTYpe::Invoice;
                        13:
                            PDocTYpe := PDocTYpe::"Credit Memo";
                        14:
                            PDocTYpe := PDocTYpe::"Blanket Order";
                        15:
                            PDocTYpe := PDocTYpe::"Return Order";
                    end;

                    PurchaseLine2.Reset();
                    PurchaseLine2.SetRange("Document Type", PDocTYpe);
                    PurchaseLine2.SetRange("Document No.", DocNo);
                    if PurchaseLine2.FindLast() then
                        LineNo := PurchaseLine2."Line No." + 1000
                    else
                        LineNo := 1000;

                    PurchaseLine.Init();
                    PurchaseLine."Document Type" := PDocTYpe;
                    PurchaseLine."Document No." := DocNo;
                    PurchaseLine."Line No." := LineNo;
                    PurchaseLine.Insert();

                    case Type of
                        1:
                            PurchaseLine.Validate(Type, PurchaseLine.Type::"G/L Account");
                        2:
                            PurchaseLine.Validate(Type, PurchaseLine.Type::Item);
                    end;
                    PurchaseLine.Validate("No.", CodeLine);
                    PurchaseLine.Validate(Description, DescriptionLine);
                    PurchaseLine.Validate("Location Code", locationCOde);
                    PurchaseLine.Validate(Quantity, Qty);
                    PurchaseLine.Validate("Unit Cost", UnitpriceCOst);
                    PurchaseLine.Validate("Line Discount Amount", DiscountAmt);
                    PurchaseLine.Modify();

                    exit(PurchaseLine."Line No.");
                end;
        end;
    end;

}