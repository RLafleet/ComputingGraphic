#include "ImageApp.h"
#include <iostream>

ImageApp::ImageApp(HINSTANCE hInstance)
    : pBitmap(nullptr), imageOffsetX(0), imageOffsetY(0), isDragging(false), pBackBuffer(nullptr) {
    // Инициализация GDI+
    Gdiplus::GdiplusStartupInput gdiplusStartupInput;
    ULONG_PTR gdiplusToken;
    Gdiplus::GdiplusStartup(&gdiplusToken, &gdiplusStartupInput, nullptr);

    // Регистрация класса окна
    WNDCLASSEX wcex = { sizeof(WNDCLASSEX) };
    wcex.style = CS_HREDRAW | CS_VREDRAW;
    wcex.lpfnWndProc = ImageApp::WndProc;
    wcex.hInstance = hInstance;
    wcex.hCursor = LoadCursor(nullptr, IDC_ARROW);
    wcex.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wcex.lpszClassName = L"Image Viewer";
    RegisterClassEx(&wcex);

    // Создание окна
    hWnd = CreateWindow(wcex.lpszClassName, L"Image Viewer", WS_OVERLAPPEDWINDOW,
                        CW_USEDEFAULT, CW_USEDEFAULT, 800, 600, nullptr, nullptr, hInstance, nullptr);

    // Установка указателя на экземпляр класса в пользовательские данные окна
    SetWindowLongPtr(hWnd, GWLP_USERDATA, reinterpret_cast<LONG_PTR>(this));
}

ImageApp::~ImageApp() {
    if (pBitmap) delete pBitmap;
    if (pBackBuffer) delete pBackBuffer;
    Gdiplus::GdiplusShutdown(0);
}

void ImageApp::Run() {
    ShowWindow(hWnd, SW_SHOW);
    UpdateWindow(hWnd);

    MSG msg;
    while (GetMessage(&msg, nullptr, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }
}

LRESULT CALLBACK ImageApp::WndProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam) {
    ImageApp* pThis = reinterpret_cast<ImageApp*>(GetWindowLongPtr(hwnd, GWLP_USERDATA));

    switch (message) {
    case WM_CREATE:
        pThis->OnCreate(hwnd);
        break;
    case WM_COMMAND:
        if (LOWORD(wParam) == 1) {
            OPENFILENAME ofn;
            wchar_t szFile[260] = { 0 };
            ZeroMemory(&ofn, sizeof(ofn));
            ofn.lStructSize = sizeof(ofn);
            ofn.hwndOwner = hwnd;
            ofn.lpstrFile = szFile;
            ofn.nMaxFile = sizeof(szFile);
            ofn.lpstrFilter = L"Images\0*.bmp;*.jpg;*.png\0";
            ofn.nFilterIndex = 1;
            ofn.Flags = OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST;

            if (GetOpenFileName(&ofn)) {
                pThis->LoadImage(hwnd, ofn.lpstrFile);
                pThis->CenterImage(hwnd);
            }
        }
        break;
    case WM_PAINT:
        pThis->OnPaint(hwnd);
        break;
    case WM_SIZE:
        pThis->CreateBackBuffer(hwnd);
        pThis->CenterImage(hwnd);
        InvalidateRect(hwnd, nullptr, TRUE);
        break;
    case WM_LBUTTONDOWN:
        pThis->isDragging = true;
        pThis->dragStart.x = LOWORD(lParam);
        pThis->dragStart.y = HIWORD(lParam);
        SetCapture(hwnd);
        break;
    case WM_LBUTTONUP:
        pThis->isDragging = false;
        ReleaseCapture();
        break;
    case WM_MOUSEMOVE:
        if (pThis->isDragging) {
            int dx = LOWORD(lParam) - pThis->dragStart.x;
            int dy = HIWORD(lParam) - pThis->dragStart.y;
            pThis->imageOffsetX += dx;
            pThis->imageOffsetY += dy;
            pThis->dragStart.x = LOWORD(lParam);
            pThis->dragStart.y = HIWORD(lParam);

            pThis->CreateBackBuffer(hwnd);
            InvalidateRect(hwnd, nullptr, FALSE);
            UpdateWindow(hwnd);
        }
        break;
    case WM_ERASEBKGND:
        return 1;
    case WM_DESTROY:
        PostQuitMessage(0);
        break;
    default:
        return DefWindowProc(hwnd, message, wParam, lParam);
    }
    return 0;
}

void ImageApp::OnPaint(HWND hwnd) {
    PAINTSTRUCT ps;
    HDC hdc = BeginPaint(hwnd, &ps);

    if (pBackBuffer) {
        Gdiplus::Graphics graphics(hdc);
        graphics.DrawImage(pBackBuffer, 0, 0);
    }

    EndPaint(hwnd, &ps);
}

void ImageApp::LoadImage(HWND hwnd, const std::wstring& filePath) {
    if (pBitmap) {
        delete pBitmap;
        pBitmap = nullptr;
    }
    pBitmap = new Gdiplus::Bitmap(filePath.c_str());
    if (pBitmap->GetLastStatus() != Gdiplus::Ok) {
        delete pBitmap;
        pBitmap = nullptr;
    }
    CreateBackBuffer(hwnd);
    InvalidateRect(hwnd, nullptr, TRUE);
}

void ImageApp::CenterImage(HWND hwnd) {
    if (!pBitmap) return;

    RECT rect;
    GetClientRect(hwnd, &rect);

    int windowWidth = rect.right - rect.left;
    int windowHeight = rect.bottom - rect.top;

    int imageWidth = pBitmap->GetWidth();
    int imageHeight = pBitmap->GetHeight();

    imageOffsetX = (windowWidth - imageWidth) / 2;
    imageOffsetY = (windowHeight - imageHeight) / 2;

    CreateBackBuffer(hwnd);
    InvalidateRect(hwnd, nullptr, TRUE);
}

void ImageApp::DrawChessboard(Gdiplus::Graphics& graphics, int width, int height) {
    const int tileSize = 20;
    for (int y = 0; y < height; y += tileSize) {
        for (int x = 0; x < width; x += tileSize) {
            bool isDark = ((x / tileSize) + (y / tileSize)) % 2 == 0;
            Gdiplus::SolidBrush brush(isDark ? Gdiplus::Color(200, 200, 200) : Gdiplus::Color(255, 255, 255));
            graphics.FillRectangle(&brush, x, y, tileSize, tileSize);
        }
    }
}

void ImageApp::CreateBackBuffer(HWND hwnd) {
    if (pBackBuffer) {
        delete pBackBuffer;
        pBackBuffer = nullptr;
    }

    RECT rect;
    GetClientRect(hwnd, &rect);
    int width = rect.right - rect.left;
    int height = rect.bottom - rect.top;

    if (width > 0 && height > 0) {
        pBackBuffer = new Gdiplus::Bitmap(width, height, PixelFormat32bppARGB);
        Gdiplus::Graphics graphics(pBackBuffer);

        DrawChessboard(graphics, width, height);

        if (pBitmap) {
            graphics.DrawImage(pBitmap, imageOffsetX, imageOffsetY, pBitmap->GetWidth(), pBitmap->GetHeight());
        }
    }
}