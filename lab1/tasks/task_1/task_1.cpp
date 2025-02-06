#include <SDL.h>
#include <iostream>

void PutPixel
(
    SDL_Renderer* renderer, 
    int x, 
    int y, 
    int screenWidth, 
    int screenHeight, 
    SDL_Color color
) 
{
    if (x >= 0 && x < screenWidth && y >= 0 && y < screenHeight) 
    {
        SDL_SetRenderDrawColor(renderer, color.r, color.g, color.b, color.a);
        SDL_RenderDrawPoint(renderer, x, y);
    }
}

void DrawCircle
(
    SDL_Renderer* renderer, 
    int centerX, 
    int centerY, 
    int radius, 
    int screenWidth, 
    int screenHeight, 
    SDL_Color color
) 
{
    int x = radius;
    int y = 0;
    int decisionOver2 = 1 - x;

    while (x >= y) 
    {
   
        y++;

        if (decisionOver2 <= 0) 
        {
            decisionOver2 += 2 * y + 1;
        }
        else 
        {
            x--;
            decisionOver2 += 2 * (y - x) + 1;
        }
    }
}

void FillCircleSquare(SDL_Renderer* renderer, int centerX, int centerY, int radius, int screenWidth, int screenHeight, SDL_Color fillColor) 
{
    int cX_start = centerX - radius;
    int cX_end = centerX + radius;
    int cY_start = centerY - radius;
    int cY_end = centerY + radius;

    // Алгоритм Брезенхема
    for (int cX = cX_start; cX <= cX_end; ++cX) 
    {
        for (int cY = cY_start; cY <= cY_end; ++cY) 
        {
            if ((cX - centerX) * (cX - centerX) + (cY - centerY) * (cY - centerY) <= radius * radius) 
            {
                PutPixel(renderer, cX, cY, screenWidth, screenHeight, fillColor);
            }
        }
    }
}

int main(int argc, char* argv[]) 
{
    if (SDL_Init(SDL_INIT_VIDEO) < 0) 
    {
        std::cout << "SDL initialization failed: " << SDL_GetError() << std::endl;
        return 1;
    }

    int screenWidth = 800;
    int screenHeight = 600;
    SDL_Window* window = SDL_CreateWindow
    (
        "Circle Drawing", 
        SDL_WINDOWPOS_UNDEFINED, 
        SDL_WINDOWPOS_UNDEFINED, 
        screenWidth, 
        screenHeight, 
        SDL_WINDOW_SHOWN
    );
    if (window == nullptr) 
    {
        std::cout << "Window creation failed: " << SDL_GetError() << std::endl;
        SDL_Quit();
        return 1;
    }

    SDL_Renderer* renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);
    if (renderer == nullptr) 
    {
        std::cout << "Renderer creation failed: " << SDL_GetError() << std::endl;
        SDL_DestroyWindow(window);
        SDL_Quit();
        return 1;
    }

    SDL_Event event;
    bool quit = false;
    int centerX = screenWidth / 2;
    int centerY = screenHeight / 2;
    int radius = 4;
    SDL_Color outlineColor = { 255, 255, 255, 255 }; 
    SDL_Color fillColor = { 0, 255, 0, 255 };     

    while (!quit) 
    {
        while (SDL_PollEvent(&event) != 0) 
        {
            if (event.type == SDL_QUIT) 
            {
                quit = true;
            }
        }

        SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
        SDL_RenderClear(renderer);

        DrawCircle(renderer, centerX, centerY, radius, screenWidth, screenHeight, outlineColor);

        FillCircleSquare(renderer, centerX, centerY, radius, screenWidth, screenHeight, fillColor);

        SDL_RenderPresent(renderer);
    }

    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    SDL_Quit();

    return 0;
}