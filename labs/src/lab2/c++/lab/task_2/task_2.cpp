#include <windows.h>
#include <commdlg.h>
#include <gdiplus.h>
#include <iostream>
#include <string>

#pragma comment(lib, "gdiplus.lib")

using namespace Gdiplus;

HWND hWnd;
Bitmap *g_pBitmap = nullptr;
bool g_isDrawing = false;
POINT g_lastPoint;
Color g_drawingColor = Color(0, 0, 0);
int g_brushSize = 5;

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
void OnPaint(HWND hwnd);
void CreateNewImage(HWND hwnd, int width, int height);
void LoadImage(HWND hwnd, const std::wstring &filePath);
void SaveImage(HWND hwnd, const std::wstring &filePath);
void DrawLine(int x1, int y1, int x2, int y2);
void ChooseColor(HWND hwnd);

int APIENTRY wWinMain(_In_ HINSTANCE hInstance, _In_opt_ HINSTANCE hPrevInstance, _In_ LPWSTR lpCmdLine, _In_ int nCmdShow)
{
    GdiplusStartupInput gdiplusStartupInput;
    ULONG_PTR gdiplusToken;
    GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, nullptr);

    WNDCLASSEX wcex = {sizeof(WNDCLASSEX)};
    wcex.style = CS_HREDRAW | CS_VREDRAW;
    wcex.lpfnWndProc = WndProc;
    wcex.hInstance = hInstance;
    wcex.hCursor = LoadCursor(nullptr, IDC_ARROW);
    wcex.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wcex.lpszClassName = L"DrawingApp";
    RegisterClassEx(&wcex);

    hWnd = CreateWindow(wcex.lpszClassName, L"Drawing Application", WS_OVERLAPPEDWINDOW,
                        CW_USEDEFAULT, CW_USEDEFAULT, 800, 600, nullptr, nullptr, hInstance, nullptr);

    ShowWindow(hWnd, nCmdShow);
    UpdateWindow(hWnd);

    MSG msg;
    while (GetMessage(&msg, nullptr, 0, 0))
    {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    GdiplusShutdown(gdiplusToken);
    return (int)msg.wParam;
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam)
{
    switch (message)
    {
    case WM_CREATE:
    {
        HMENU hMenu = CreateMenu();
        HMENU hFileMenu = CreatePopupMenu();
        AppendMenu(hFileMenu, MF_STRING, 1, L"New");
        AppendMenu(hFileMenu, MF_STRING, 2, L"Open");
        AppendMenu(hFileMenu, MF_STRING, 3, L"Save As");
        AppendMenu(hFileMenu, MF_SEPARATOR, 0, nullptr);
        AppendMenu(hFileMenu, MF_STRING, 4, L"Exit");
        AppendMenu(hMenu, MF_POPUP, (UINT_PTR)hFileMenu, L"File");

        HMENU hToolsMenu = CreatePopupMenu();
        AppendMenu(hToolsMenu, MF_STRING, 5, L"Choose Color");
        AppendMenu(hMenu, MF_POPUP, (UINT_PTR)hToolsMenu, L"Tools");

        SetMenu(hwnd, hMenu);
        break;
    }
    case WM_COMMAND:
    {
        switch (LOWORD(wParam))
        {
        case 1:
            CreateNewImage(hwnd, 800, 600);
            break;
        case 2:
        {
            OPENFILENAME ofn;
            wchar_t szFile[260] = {0};
            ZeroMemory(&ofn, sizeof(ofn));
            ofn.lStructSize = sizeof(ofn);
            ofn.hwndOwner = hwnd;
            ofn.lpstrFile = szFile;
            ofn.nMaxFile = sizeof(szFile);
            ofn.lpstrFilter = L"Images\0*.bmp;*.jpg;*.png\0";
            ofn.nFilterIndex = 1;
            ofn.Flags = OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST;

            if (GetOpenFileName(&ofn))
            {
                LoadImage(hwnd, ofn.lpstrFile);
            }
        }
        break;
        case 3:
        {
            OPENFILENAME ofn;
            wchar_t szFile[260] = {0};
            ZeroMemory(&ofn, sizeof(ofn));
            ofn.lStructSize = sizeof(ofn);
            ofn.hwndOwner = hwnd;
            ofn.lpstrFile = szFile;
            ofn.nMaxFile = sizeof(szFile);
            ofn.lpstrFilter = L"PNG\0*.png\0JPEG\0*.jpg\0BMP\0*.bmp\0";
            ofn.nFilterIndex = 1;
            ofn.Flags = OFN_PATHMUSTEXIST | OFN_OVERWRITEPROMPT;

            if (GetSaveFileName(&ofn))
            {
                SaveImage(hwnd, ofn.lpstrFile);
            }
        }
        break;
        case 4:
            PostQuitMessage(0);
            break;
        case 5:
            ChooseColor(hwnd);
            break;
        }
        break;
    }
    case WM_PAINT:
    {
        OnPaint(hwnd);
        break;
    }
    case WM_LBUTTONDOWN:
    {
        g_isDrawing = true;
        g_lastPoint.x = LOWORD(lParam);
        g_lastPoint.y = HIWORD(lParam);
        break;
    }
    case WM_LBUTTONUP:
    {
        g_isDrawing = false;
        break;
    }
    case WM_MOUSEMOVE:
    {
        if (g_isDrawing)
        {
            int x = LOWORD(lParam);
            int y = HIWORD(lParam);
            DrawLine(g_lastPoint.x, g_lastPoint.y, x, y);
            g_lastPoint.x = x;
            g_lastPoint.y = y;
            InvalidateRect(hwnd, nullptr, FALSE);
            UpdateWindow(hwnd);
        }
        break;
    }
    case WM_DESTROY:
    {
        PostQuitMessage(0);
        break;
    }
    default:
        return DefWindowProc(hwnd, message, wParam, lParam);
    }
    return 0;
}

void OnPaint(HWND hwnd)
{
    PAINTSTRUCT ps;
    HDC hdc = BeginPaint(hwnd, &ps);

    if (g_pBitmap)
    {
        Graphics graphics(hdc);
        graphics.DrawImage(g_pBitmap, 0, 0);
    }

    EndPaint(hwnd, &ps);
}

void CreateNewImage(HWND hwnd, int width, int height)
{
    if (g_pBitmap)
    {
        delete g_pBitmap;
        g_pBitmap = nullptr;
    }
    g_pBitmap = new Bitmap(width, height, PixelFormat32bppARGB);
    Graphics graphics(g_pBitmap);
    graphics.Clear(Color(255, 255, 255));
    InvalidateRect(hwnd, nullptr, TRUE);
}

void LoadImage(HWND hwnd, const std::wstring &filePath)
{
    if (g_pBitmap)
    {
        delete g_pBitmap;
        g_pBitmap = nullptr;
    }
    g_pBitmap = new Bitmap(filePath.c_str());
    if (g_pBitmap->GetLastStatus() != Ok)
    {
        delete g_pBitmap;
        g_pBitmap = nullptr;
    }
    InvalidateRect(hwnd, nullptr, TRUE);
}

int GetEncoderClsid(const WCHAR *format, CLSID *pClsid)
{
    UINT num = 0;
    UINT size = 0;
    GetImageEncodersSize(&num, &size);
    if (size == 0)
        return -1;

    ImageCodecInfo *pImageCodecInfo = (ImageCodecInfo *)malloc(size);
    if (!pImageCodecInfo)
        return -1;

    GetImageEncoders(num, size, pImageCodecInfo);

    for (UINT i = 0; i < num; i++)
    {
        if (wcscmp(pImageCodecInfo[i].MimeType, format) == 0)
        {
            *pClsid = pImageCodecInfo[i].Clsid;
            free(pImageCodecInfo);
            return i;
        }
    }

    free(pImageCodecInfo);
    return -1;
}

void SaveImage(HWND hwnd, const std::wstring &filePath)
{
    if (!g_pBitmap)
        return;

    CLSID clsid;
    if (filePath.find(L".png") != std::wstring::npos)
    {
        GetEncoderClsid(L"image/png", &clsid);
    }
    else if (filePath.find(L".jpg") != std::wstring::npos)
    {
        GetEncoderClsid(L"image/jpeg", &clsid);
    }
    else if (filePath.find(L".bmp") != std::wstring::npos)
    {
        GetEncoderClsid(L"image/bmp", &clsid);
    }
    else
    {
        MessageBox(hwnd, L"Unsupported file format", L"Error", MB_ICONERROR);
        return;
    }

    g_pBitmap->Save(filePath.c_str(), &clsid, nullptr);
}

void DrawLine(int x1, int y1, int x2, int y2)
{
    if (!g_pBitmap)
        return;

    Graphics graphics(g_pBitmap);
    Pen pen(g_drawingColor, g_brushSize);
    graphics.DrawLine(&pen, x1, y1, x2, y2);
}

void ChooseColor(HWND hwnd)
{
    CHOOSECOLOR cc;
    static COLORREF acrCustClr[16];
    ZeroMemory(&cc, sizeof(cc));
    cc.lStructSize = sizeof(cc);
    cc.hwndOwner = hwnd;
    cc.lpCustColors = (LPDWORD)acrCustClr;
    cc.rgbResult = RGB(g_drawingColor.GetRed(), g_drawingColor.GetGreen(), g_drawingColor.GetBlue());
    cc.Flags = CC_FULLOPEN | CC_RGBINIT;

    if (ChooseColor(&cc))
    {
        g_drawingColor = Color(GetRValue(cc.rgbResult), GetGValue(cc.rgbResult), GetBValue(cc.rgbResult));
    }
}