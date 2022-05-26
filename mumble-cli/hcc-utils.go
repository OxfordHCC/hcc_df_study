package main

import (
	"context"
	"time"
	"fmt"
	"strings"
	"os"

	flag "github.com/spf13/pflag"
)


func getCtx() (context.Context, context.CancelFunc){
	return context.WithTimeout(context.Background(), time.Second)
}

type PosArg struct {
	name string
	optional bool
	vararg bool
}

func UsageWithArgs(name string, flagSet flag.FlagSet, posargs []PosArg) func() {
	return func (){
		var sb strings.Builder
		
		sb.WriteString(fmt.Sprintf("Usage: %s", name));
		for _, parg := range posargs {
			prefix := "<"
			suffix := ">"
			
			if(parg.optional){
				prefix = "["
				suffix = "]"
			}
			
			if(parg.vararg){
				prefix = prefix + "..."
			}
			
			sb.WriteString(fmt.Sprintf(" %s%s%s", prefix, parg.name, suffix))
		}
		
		// this should be flag.CommandLine.Output() but for some reason it says that's undefined
		fmt.Fprintf(os.Stderr, sb.String())
		flagSet.PrintDefaults()
		fmt.Fprintln(os.Stderr, "\n");
	}
}
