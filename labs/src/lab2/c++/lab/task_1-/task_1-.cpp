#include <windows.h>
#include <commdlg.h>
#include <gdiplus.h>
#include <iostream>
#include <string>

#pragma comment(lib, "gdiplus.lib")

using namespace Gdiplus;

HWND hWnd;
Bitmap *g_pBitmap = nullptr;
int g_imageOffsetX = 0;
int g_imageOffsetY = 0;
bool g_isDragging = false;
POINT g_dragStart;
Bitmap *g_pBackBuffer = nullptr;

LRESULT CALLBACK WndProc(HWND, UINT, WPARAM, LPARAM);
void OnPaint(HWND hwnd);
void LoadImage(HWND hwnd, const std::wstring &filePath);
void CenterImage(HWND hwnd);
void DrawChessboard(Graphics &graphics, int width, int height);
void CreateBackBuffer(HWND hwnd);

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
    wcex.lpszClassName = L"Image Viewer";
    RegisterClassEx(&wcex);

    hWnd = CreateWindow(wcex.lpszClassName, L"Image Viewer", WS_OVERLAPPEDWINDOW,
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
        AppendMenu(hFileMenu, MF_STRING, 1, L"Open");
        AppendMenu(hMenu, MF_POPUP, (UINT_PTR)hFileMenu, L"File");
        SetMenu(hwnd, hMenu);
        break;
    }
    case WM_COMMAND:
    {
        if (LOWORD(wParam) == 1)
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
                CenterImage(hwnd);
            }
        }
        break;
    }
    case WM_PAINT:
    {
        OnPaint(hwnd);
        break;
    }
    case WM_SIZE:
    {
        CreateBackBuffer(hwnd);
        CenterImage(hwnd);
        InvalidateRect(hwnd, nullptr, TRUE);
        break;
    }
    case WM_LBUTTONDOWN:
    {
        g_isDragging = true;
        g_dragStart.x = LOWORD(lParam);
        g_dragStart.y = HIWORD(lParam);
        SetCapture(hwnd);
        break;
    }
    case WM_LBUTTONUP:
    {
        g_isDragging = false;
        ReleaseCapture();
        break;
    }
    case WM_MOUSEMOVE:
    {
        if (g_isDragging)
        {
            int dx = LOWORD(lParam) - g_dragStart.x;
            int dy = HIWORD(lParam) - g_dragStart.y;
            g_imageOffsetX += dx;
            g_imageOffsetY += dy;
            g_dragStart.x = LOWORD(lParam);
            g_dragStart.y = HIWORD(lParam);

            CreateBackBuffer(hwnd);
            InvalidateRect(hwnd, nullptr, FALSE); 
            UpdateWindow(hwnd);                   
        }
        break;
    }
    case WM_ERASEBKGND:
    {
        return 1;
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

    if (g_pBackBuffer)
    {
        Graphics graphics(hdc);
        graphics.DrawImage(g_pBackBuffer, 0, 0);
    }

    EndPaint(hwnd, &ps);
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
    CreateBackBuffer(hwnd);
    InvalidateRect(hwnd, nullptr, TRUE);
}

void CenterImage(HWND hwnd)
{
    if (!g_pBitmap)
        return;

    RECT rect;
    GetClientRect(hwnd, &rect);

    int windowWidth = rect.right - rect.left;
    int windowHeight = rect.bottom - rect.top;

    int imageWidth = g_pBitmap->GetWidth();
    int imageHeight = g_pBitmap->GetHeight();

    g_imageOffsetX = (windowWidth - imageWidth) / 2;
    g_imageOffsetY = (windowHeight - imageHeight) / 2;

    CreateBackBuffer(hwnd);
    InvalidateRect(hwnd, nullptr, TRUE);
}

void DrawChessboard(Graphics &graphics, int width, int height)
{
    const int tileSize = 20;
    for (int y = 0; y < height; y += tileSize)
    {
        for (int x = 0; x < width; x += tileSize)
        {
            bool isDark = ((x / tileSize) + (y / tileSize)) % 2 == 0;
            SolidBrush brush(isDark ? Color(200, 200, 200) : Color(255, 255, 255));
            graphics.FillRectangle(&brush, x, y, tileSize, tileSize);
        }
    }
}

void CreateBackBuffer(HWND hwnd)
{
    if (g_pBackBuffer)
    {
        delete g_pBackBuffer;
        g_pBackBuffer = nullptr;
    }

    RECT rect;
    GetClientRect(hwnd, &rect);
    int width = rect.right - rect.left;
    int height = rect.bottom - rect.top;

    if (width > 0 && height > 0)
    {
        g_pBackBuffer = new Bitmap(width, height, PixelFormat32bppARGB);
        Graphics graphics(g_pBackBuffer);

        DrawChessboard(graphics, width, height);

        if (g_pBitmap)
        {
            graphics.DrawImage(g_pBitmap, g_imageOffsetX, g_imageOffsetY, g_pBitmap->GetWidth(), g_pBitmap->GetHeight());
        }
    }
}