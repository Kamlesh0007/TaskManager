
import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import type { ComponentPropsWithoutRef } from "react"
type PasswordInputProps = ComponentPropsWithoutRef<typeof Input> & {
  value?: string
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ value,className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState<Boolean>(false)

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={`pr-10 ${className ?? ""}`}
          {...props}
        />
         {value && value.length >= 1 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
)}
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"
